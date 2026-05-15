using System;
using System.Diagnostics;

class ClaudeLauncher
{
    static void Main()
    {
        var psi = new ProcessStartInfo
        {
            FileName = "cmd.exe",
            Arguments = "/k claude",
            UseShellExecute = true,
            WorkingDirectory = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile)
        };
        
        try
        {
            Process.Start(psi);
        }
        catch (Exception ex)
        {
            Console.WriteLine("启动失败: " + ex.Message);
            Console.WriteLine("请确保已安装: npm install -g @anthropic-ai/claude-code");
            Console.ReadKey();
        }
    }
}
