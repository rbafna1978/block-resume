import { NextResponse } from "next/server";
import os from "os";
import path from "path";
import { promises as fs } from "fs";
import { existsSync } from "fs";
import { spawn } from "child_process";
import { renderLatex } from "@/lib/render";
import { validateResumeDocument } from "@/lib/schema";

const DOCKER_IMAGE = process.env.LATEX_DOCKER_IMAGE || "texlive/texlive:latest";
const USE_TECTONIC = process.env.USE_TECTONIC === "1";
const USE_TEXLIVE = process.env.USE_TEXLIVE === "1";

const runCommand = (
  command: string,
  args: string[],
  options: { cwd: string; timeoutMs: number }
): Promise<{ code: number | null; stdout: string; stderr: string }> =>
  new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let settled = false;

    const settle = (payload: { code: number | null; stdout: string; stderr: string }) => {
      if (settled) return;
      settled = true;
      resolve(payload);
    };

    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
    }, options.timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      const message = error instanceof Error ? error.message : "Command failed to spawn";
      settle({ code: 127, stdout, stderr: stderr || message });
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      settle({ code, stdout, stderr });
    });
  });

const readLogSnippet = async (dir: string) => {
  const logPath = path.join(dir, "resume.log");
  try {
    const log = await fs.readFile(logPath, "utf8");
    return log.slice(-2000);
  } catch {
    return "";
  }
};

const compileWithDocker = async (dir: string) => {
  const platform =
    process.env.LATEX_DOCKER_PLATFORM || (process.arch === "arm64" ? "linux/amd64" : "");
  const args = [
    "run",
    "--rm",
    "--network=none",
    "--cpus=1",
    "--memory=512m",
    "--pids-limit=256",
    "--security-opt=no-new-privileges",
    ...(platform ? ["--platform", platform] : []),
    "-v",
    `${dir}:/work`,
    "-w",
    "/work",
    DOCKER_IMAGE,
    "latexmk",
    "-pdf",
    "-interaction=nonstopmode",
    "-halt-on-error",
    "-file-line-error",
    "-latexoption=-no-shell-escape",
    "resume.tex",
  ];

  return runCommand("docker", args, { cwd: dir, timeoutMs: 60000 });
};

const pickLatexmk = () => {
  const candidates = [
    "/usr/bin/latexmk",
    "/usr/local/bin/latexmk",
    "/usr/local/texlive/bin/x86_64-linux/latexmk",
    "/usr/local/texlive/bin/x86_64-linux/latexmk",
  ];
  for (const candidate of candidates) {
    try {
      if (existsSync(candidate)) return candidate;
    } catch {
      continue;
    }
  }
  return "latexmk";
};

const compileWithTexlive = async (dir: string) => {
  const latexmk = pickLatexmk();
  const args = [
    latexmk,
    "-pdf",
    "-interaction=nonstopmode",
    "-halt-on-error",
    "-file-line-error",
    "-latexoption=-no-shell-escape",
    "resume.tex",
  ];
  return runCommand(args[0], args.slice(1), { cwd: dir, timeoutMs: 8000 });
};

const compileWithTectonic = async (dir: string) => {
  const args = ["-X", "compile", "resume.tex", "--outdir", dir, "--keep-logs"];
  return runCommand("tectonic", args, { cwd: dir, timeoutMs: 8000 });
};

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  if (!validateResumeDocument(payload)) {
    return NextResponse.json({ message: "Invalid resume schema" }, { status: 400 });
  }

  const resume = payload;
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "block-resume-"));
  try {
    const latex = renderLatex(resume);
    const texPath = path.join(tempDir, "resume.tex");
    await fs.writeFile(texPath, latex, "utf8");

    const result = USE_TEXLIVE
      ? await compileWithTexlive(tempDir)
      : USE_TECTONIC
        ? await compileWithTectonic(tempDir)
        : await compileWithDocker(tempDir);

    if (result.code !== 0) {
      const latexLogSnippet = await readLogSnippet(tempDir);
      const missingDocker =
        !USE_TECTONIC &&
        !USE_TEXLIVE &&
        (result.stderr.includes("spawn docker") || result.stderr.includes("ENOENT"));
      return NextResponse.json(
        {
          message: missingDocker
            ? "Docker not found. Install Docker or set USE_TECTONIC=1 to use a local tectonic binary."
            : "Compilation failed",
          latexLogSnippet: latexLogSnippet || result.stderr || result.stdout,
        },
        { status: 500 }
      );
    }

    const pdfPath = path.join(tempDir, "resume.pdf");
    const pdf = await fs.readFile(pdfPath);
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    const latexLogSnippet = await readLogSnippet(tempDir);
    return NextResponse.json(
      {
        message: "Compilation failed",
        latexLogSnippet: latexLogSnippet || (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
