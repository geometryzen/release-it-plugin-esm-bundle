import fs from "node:fs";
import path from "node:path";
import { Plugin } from "release-it";

const fileName = path.join(process.cwd(), "./package.json");
const semverRegEx = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-z-]+(?:\.[\da-z-]+)*))?(\+[\da-z-]+)?$/i;

export interface VersionPluginOptions {
    depName?: string;
}

interface PackageJson {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
}

export default class VersionPlugin extends Plugin<VersionPluginOptions> {
    /**
     * @override
     */
    static disablePlugin(): string[] {
        const depName = getDepName();
        const depVersion = getDepVersion(depName);
        const packageJson = readPackageJson();
        if (packageJson.version.startsWith(depVersion)) {
            console.warn(`Disabling release-it because this version is already published.`);
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
        if (this.options.depName) {
            const depName = this.options.depName;
            return getDepVersion(depName);
        }
        else {
            const depName = getDepName();
            return getDepVersion(depName);
        }
    }
}

/**
 * Computes the underlying dependency name from the wrapper package name assuming the convention
 * that the wrapper package name is a scoped version of the original.
 * @returns The part of the wrapper bundle name
 */
function getDepName(): string {
    const packageJson = readPackageJson();
    const wrapperScope = getWrapperScope(packageJson);
    const withoutPrefix = packageJson.name.replace(`@${wrapperScope}/`, "");
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
    const packageJson = readPackageJson();
    const semverRange: string = getSemverRange(packageJson, depName);
    const parts = semverRegEx.exec(semverRange);
    if (parts) {
        return parts[0];
    }
    else {
        throw new Error(`Unable to determine version for package.json dependency ${JSON.stringify(depName)}.`);
    }
}

/**
 * Returns the semantic version range for the dependency in the package.json object.
 * The dependency is looked for in (order) "dependencies", "pperDependencies", "devDependencies".
 * @param pkg 
 * @param depName 
 * @returns 
 */
function getSemverRange(pkg: PackageJson, depName: string): string {
    if (pkg.dependencies) {
        if (pkg.dependencies[depName]) {
            return pkg.dependencies[depName];
        }
    }
    if (pkg.peerDependencies) {
        if (pkg.peerDependencies[depName]) {
            return pkg.peerDependencies[depName];
        }
    }
    if (pkg.devDependencies) {
        if (pkg.devDependencies[depName]) {
            return pkg.devDependencies[depName];
        }
    }
    throw Error(`Missing package.json dependency '${depName}'`);
}

function readPackageJson(): PackageJson {
    const pkg = JSON.parse(fs.readFileSync(fileName).toString()) as PackageJson;
    if (!pkg.name) {
        throw Error(`package.json must have name property'`);
    }
    if (!pkg.version) {
        throw Error(`package.json must have a version property'`);
    }
    return pkg;
}

function getWrapperScope(pkg: PackageJson): string {
    const amperPos = pkg.name.indexOf("@");
    if (amperPos < 0) {
        throw new Error(``);
    }
    const slashPos = pkg.name.indexOf("/");
    return pkg.name.substring(1, slashPos);
}
