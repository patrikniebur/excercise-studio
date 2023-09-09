export enum EXERCISE_ERROR {
  "FILE_NOT_EXIST",
  "NOT_IN_CONFIG"
}

export type DirectoryConfiguration = {
    folderName: string;
    exercises: ExerciseConfig[];
  };
  export type ExerciseConfig = {
    id: string;
    handle: FileSystemFileHandle;
    fileName: string;
    text: string;
    error?: EXERCISE_ERROR;
  };