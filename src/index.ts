import fs from "node:fs";
import path from "node:path";
import { Plugin } from "release-it";

const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "./package.json")).toString()
);
/**
 * This could be a configuration parameter.
 */
const bundleScope = "@geometryzen";

export default class CustomVersion extends Plugin {
    /**
     * @override
     */
    static disablePlugin(): string[] {
        const depName = getDepName();
        const depVersion = getDepVersion(depName);
        if (packageJson.version.startsWith(depVersion)) {
            console.log(`Disabling release-it because this version is already published.`);
            return ["git", "github", "npm", "version"];
        }
        else {
            return [];
        }
    }
    /**
     * @override
     */
    getIncrementedVersionCI(): string {
        const depName = getDepName();
        return getDepVersion(depName);
    }
}

/**
 * Computes the underlying dependency name from the wrapper package name assuming the convention
 * that the wrapper package name is a scoped version of the original.
 * @returns The part of the wrapper bundle name
 */
function getDepName(): string {
    if (!packageJson.name) {
        throw Error(`package.json must have name with format '${bundleScope}/name'`);
    }
    const withoutPrefix = packageJson.name.replace(`${bundleScope}/`, "");
    const [scope, name] = withoutPrefix.split("__");
    if (name) {
        // a scoped package
        return `@${scope}/${name}`;
    }
    else {
        return scope;
    }
}

/**
 * Determines the dependency version
 * @param depName {string} 
 */
function getDepVersion(depName: string): string {
    const semverRegEx = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-z-]+(?:\.[\da-z-]+)*))?(\+[\da-z-]+)?$/i;
    const dependency: string = (packageJson.dependencies || {})[depName];
    if (!dependency) {
        throw Error(`Missing package.json dependency '${depName}'`);
    }
    const parts = semverRegEx.exec(dependency);
    if (parts) {
        return parts[0];
    }
    else {
        throw new Error(`Unable to determine version for package.json dependency ${JSON.stringify(depName)}.`);
    }
}
