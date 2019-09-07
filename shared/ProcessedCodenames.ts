export class ProcessedCodenames {
    public static initialize() {
        this.processedCodenames = new Set();
    }

    public static has(codename: string) {
        return this.processedCodenames.has(codename);
    }

    public static add(codename: string) {
        this.processedCodenames.add(codename);
    }

    private static processedCodenames: Set<string>;
}
