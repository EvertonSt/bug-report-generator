import si from "systeminformation";
import os from "os";

export async function getEnvironmentInfo() {
  try {
    const cpu = await si.cpu();
    const mem = await si.mem();
    return {
      os: `${os.type()} ${os.release()}`,
      cpu: `${cpu.manufacturer} ${cpu.brand}`,
      ramGB: Math.round(mem.total / 1024 / 1024 / 1024),
      browser: process.env.BUG_REPORT_BROWSER || "Not specified"
    };
  } catch {
    return {
      os: os.type(),
      cpu: "Unknown",
      ramGB: "Unknown",
      browser: process.env.BUG_REPORT_BROWSER || "Not specified"
    };
  }
}
