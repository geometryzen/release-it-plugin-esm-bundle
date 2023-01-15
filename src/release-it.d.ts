declare module "release-it" {
    class Plugin<T> {
        static disablePlugin(): string[];
        options: T;
        getIncrementedVersionCI(): string;
    }
}