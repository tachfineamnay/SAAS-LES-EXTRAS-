/**
 * tests/skills-json.spec.mjs
 *
 * Valide la structure de skills.json du pack UX-Arch 2026 Extras.
 *
 * Usage : node --test .agent/skills/ux-arch-2026/extras/tests/skills-json.spec.mjs
 *
 * Vérifications :
 * - Le fichier skills.json est lisible et parsable
 * - Les champs obligatoires (pack, version, skills) sont présents
 * - Tous les IDs EX-01..EX-09 sont présents
 * - Toutes les priorités sont dans { P0, P1, P2 }
 * - Chaque skill a les champs requis (id, name, priority, targets, acceptance, effortDays, metrics)
 */

import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_JSON_PATH = path.join(__dirname, "..", "skills.json");

const REQUIRED_IDS = [
    "EX-01",
    "EX-02",
    "EX-03",
    "EX-04",
    "EX-05",
    "EX-06",
    "EX-07",
    "EX-08",
    "EX-09",
];

const VALID_PRIORITIES = new Set(["P0", "P1", "P2"]);

const REQUIRED_SKILL_FIELDS = [
    "id",
    "name",
    "priority",
    "targets",
    "acceptance",
    "effortDays",
    "metrics",
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("skills.json — structure validation", () => {
    /** @type {Object} */
    let skillsData;

    it("should be readable and valid JSON", async () => {
        const raw = await readFile(SKILLS_JSON_PATH, "utf8").catch(() => {
            assert.fail(
                `Cannot read skills.json at ${SKILLS_JSON_PATH}.\n` +
                "Make sure the file exists and is committed."
            );
        });

        skillsData = JSON.parse(raw);
        assert.ok(skillsData, "Parsed JSON is truthy");
    });

    it("should have required top-level fields (pack, version, skills)", async () => {
        const raw = await readFile(SKILLS_JSON_PATH, "utf8");
        skillsData = JSON.parse(raw);

        assert.ok(
            typeof skillsData.pack === "string" && skillsData.pack.length > 0,
            "Field 'pack' must be a non-empty string"
        );
        assert.ok(
            typeof skillsData.version === "string" && skillsData.version.length > 0,
            "Field 'version' must be a non-empty string"
        );
        assert.ok(
            Array.isArray(skillsData.skills),
            "Field 'skills' must be an array"
        );
        assert.ok(
            skillsData.skills.length > 0,
            "Field 'skills' must not be empty"
        );
    });

    it("should contain all required skill IDs (EX-01..EX-09)", async () => {
        const raw = await readFile(SKILLS_JSON_PATH, "utf8");
        skillsData = JSON.parse(raw);

        const foundIds = new Set(skillsData.skills.map((s) => s.id));

        for (const requiredId of REQUIRED_IDS) {
            assert.ok(
                foundIds.has(requiredId),
                `Missing skill ID: ${requiredId} in skills.json`
            );
        }
    });

    it("should have valid priorities (P0, P1, or P2) for all skills", async () => {
        const raw = await readFile(SKILLS_JSON_PATH, "utf8");
        skillsData = JSON.parse(raw);

        for (const skill of skillsData.skills) {
            assert.ok(
                VALID_PRIORITIES.has(skill.priority),
                `Skill ${skill.id} has invalid priority: "${skill.priority}". Must be P0, P1, or P2.`
            );
        }
    });

    it("should have all required fields on each skill", async () => {
        const raw = await readFile(SKILLS_JSON_PATH, "utf8");
        skillsData = JSON.parse(raw);

        for (const skill of skillsData.skills) {
            for (const field of REQUIRED_SKILL_FIELDS) {
                assert.ok(
                    field in skill,
                    `Skill ${skill.id} is missing required field: "${field}"`
                );
            }

            // Type checks
            assert.ok(
                Array.isArray(skill.targets),
                `Skill ${skill.id}: 'targets' must be an array`
            );
            assert.ok(
                skill.targets.length > 0,
                `Skill ${skill.id}: 'targets' must not be empty`
            );
            assert.ok(
                Array.isArray(skill.acceptance),
                `Skill ${skill.id}: 'acceptance' must be an array`
            );
            assert.ok(
                skill.acceptance.length > 0,
                `Skill ${skill.id}: 'acceptance' must not be empty`
            );
            assert.ok(
                Array.isArray(skill.metrics),
                `Skill ${skill.id}: 'metrics' must be an array`
            );
            assert.ok(
                typeof skill.effortDays === "number",
                `Skill ${skill.id}: 'effortDays' must be a number`
            );
        }
    });

    it("should have exactly 9 skills", async () => {
        const raw = await readFile(SKILLS_JSON_PATH, "utf8");
        skillsData = JSON.parse(raw);

        assert.strictEqual(
            skillsData.skills.length,
            9,
            `Expected 9 skills, found ${skillsData.skills.length}`
        );
    });
});
