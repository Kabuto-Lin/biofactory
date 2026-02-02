using KSIKernel_Core;

namespace Sinon_Factory.Services
{
    public class FileWatchService
    {
        private static MyLogger myLogger = new MyLogger(LoggerType.SYSTEM, "FileWatchService");

        public void Run()
        {
            string viewPath = Path.GetFullPath("~/Views").Replace("~\\", "");
            string jsPath = Path.GetFullPath("~/wwwroot/build/js").Replace("~\\", "");
            string[] checkPaths = new string[2];
            checkPaths[0] = viewPath;
            checkPaths[1] = jsPath;
            foreach (string checkPath in checkPaths)
            {
                Watch(checkPath);
            }
        }

        private void Watch(string watch_folder)
        {
            FileSystemWatcher watcher = new FileSystemWatcher();
            watcher.Path = watch_folder;

            watcher.NotifyFilter = NotifyFilters.LastAccess | NotifyFilters.LastWrite
               | NotifyFilters.FileName | NotifyFilters.DirectoryName;

            watcher.Filter = "*.*";

            watcher.Changed += new FileSystemEventHandler(OnChanged);
            watcher.Created += new FileSystemEventHandler(OnChanged);
            watcher.Deleted += new FileSystemEventHandler(OnChanged);
            watcher.Renamed += new RenamedEventHandler(OnRenamed);

            // Begin watching.
            watcher.EnableRaisingEvents = true;
        }

        private static void OnChanged(object source, FileSystemEventArgs e)
        {
            // Specify what is done when a file is changed, created, or deleted.
            switch (e.ChangeType)
            {
                case WatcherChangeTypes.Created:
                    myLogger.WriteLog(LogType.Info, "檔案：" + e.Name + "被新增");
                    break;

                case WatcherChangeTypes.Changed:
                    myLogger.WriteLog(LogType.Info, "檔案：" + e.Name + "被修正");
                    break;

                case WatcherChangeTypes.Deleted:
                    myLogger.WriteLog(LogType.Info, "檔案：" + e.Name + "被刪除");
                    break;
            }
        }

        private static void OnRenamed(object source, RenamedEventArgs e)
        {
            // Specify what is done when a file is renamed.
            myLogger.WriteLog(LogType.Info, "檔案：" + e.Name + "被重新命名");
        }
    }
}
