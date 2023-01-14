declare module "release-it" {
    class Plugin {
        static disablePlugin(): string[];
        getIncrementedVersionCI(): string;
    }
}