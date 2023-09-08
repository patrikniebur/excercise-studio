export type DirectoryConfiguration = {
    folderName: string;
    exercises: ExerciseConfig[];
  };
  export type ExerciseConfig = {
    id: string;
    handle: FileSystemFileHandle;
    fileName: string;
    text: string;
    error?: string;
  };