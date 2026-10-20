/**
 * Cyberlife — Central Cybersecurity Arsenal Registry
 *
 * Central, deterministic registry managing tool registration, query filtering,
 * prerequisite resolution, schema validation, and related-entity discovery.
 *
 * Independent of React rendering — purely functional and unit-testable.
 */

import {
  CyberToolDefinition,
  ToolCategory,
  TeamTrack,
  CapabilityStatus,
  InterfaceMode,
} from './types';
import { CYBER_ARSENAL_DEFINITIONS } from './toolDefinitions';

export interface ToolFilterCriteria {
  readonly team?: TeamTrack | 'all';
  readonly category?: ToolCategory | 'all';
  readonly status?: CapabilityStatus | 'all';
  readonly interfaceMode?: InterfaceMode | 'all';
  readonly clearanceTier?: 1 | 2;
  readonly searchQuery?: string;
}

export interface RegistryValidationReport {
  readonly valid: boolean;
  readonly totalTools: number;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly missingReferences: readonly {
    readonly toolId: string;
    readonly missingRelatedToolId: string;
  }[];
}

export class CyberArsenalRegistry {
  private readonly toolsById = new Map<string, CyberToolDefinition>();
  private deterministicOrder: string[] = [];

  constructor(initialTools: readonly CyberToolDefinition[] = CYBER_ARSENAL_DEFINITIONS) {
    for (const tool of initialTools) {
      this.registerTool(tool);
    }
  }

  /**
   * Registers a single cyber tool definition.
   * Throws an error if duplicate ID is encountered.
   */
  public registerTool(tool: CyberToolDefinition): void {
    if (!tool.id || typeof tool.id !== 'string') {
      throw new Error(`Invalid tool registration: missing or non-string tool ID.`);
    }

    if (this.toolsById.has(tool.id)) {
      throw new Error(
        `Duplicate tool ID detected: '${tool.id}' is already registered in CyberArsenalRegistry.`
      );
    }

    this.toolsById.set(tool.id, tool);
    this.deterministicOrder.push(tool.id);
    this.deterministicOrder.sort(); // Maintain stable alphabetical sort by tool ID
  }

  /**
   * Resolves a tool by its stable ID.
   */
  public getTool(id: string): CyberToolDefinition | undefined {
    return this.toolsById.get(id);
  }

  /**
   * Returns all registered tools in deterministic order.
   */
  public getAllTools(): readonly CyberToolDefinition[] {
    return this.deterministicOrder
      .map(id => this.toolsById.get(id))
      .filter((t): t is CyberToolDefinition => t !== undefined);
  }

  /**
   * Filters tools by cybersecurity team track.
   */
  public getToolsByTeam(team: TeamTrack): readonly CyberToolDefinition[] {
    return this.getAllTools().filter(
      t => t.primaryTeam === team || t.supportedTeams.includes(team)
    );
  }

  /**
   * Filters tools by functional category.
   */
  public getToolsByCategory(category: ToolCategory): readonly CyberToolDefinition[] {
    return this.getAllTools().filter(t => t.category === category);
  }

  /**
   * Filters tools by implementation status.
   */
  public getToolsByStatus(status: CapabilityStatus): readonly CyberToolDefinition[] {
    return this.getAllTools().filter(t => t.status === status);
  }

  /**
   * Searches tools by query text and multi-axis criteria.
   */
  public searchTools(criteria: ToolFilterCriteria): readonly CyberToolDefinition[] {
    const q = criteria.searchQuery?.trim().toLowerCase();

    return this.getAllTools().filter(tool => {
      // 1. Team Filter
      if (criteria.team && criteria.team !== 'all') {
        const matchesTeam =
          tool.primaryTeam === criteria.team || tool.supportedTeams.includes(criteria.team);
        if (!matchesTeam) return false;
      }

      // 2. Category Filter
      if (criteria.category && criteria.category !== 'all' && tool.category !== criteria.category) {
        return false;
      }

      // 3. Status Filter
      if (criteria.status && criteria.status !== 'all' && tool.status !== criteria.status) {
        return false;
      }

      // 4. Interface Mode Filter
      if (
        criteria.interfaceMode &&
        criteria.interfaceMode !== 'all' &&
        tool.interfaceMode !== criteria.interfaceMode &&
        tool.interfaceMode !== 'both'
      ) {
        return false;
      }

      // 5. Clearance Tier Filter
      if (
        criteria.clearanceTier !== undefined &&
        tool.requiredClearanceTier > criteria.clearanceTier
      ) {
        return false;
      }

      // 6. Text Search Query
      if (q) {
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesShortName = tool.shortName.toLowerCase().includes(q);
        const matchesDesc = tool.description.toLowerCase().includes(q);
        const matchesExtended = tool.extendedOverview.toLowerCase().includes(q);
        const matchesInspiration = tool.realWorldInspiration.toLowerCase().includes(q);
        const matchesCategory = tool.categoryLabel.toLowerCase().includes(q);
        const matchesCommand =
          tool.commandSpec?.canonicalCommand.toLowerCase().includes(q) ||
          tool.commandSpec?.aliases.some(a => a.toLowerCase().includes(q));
        const matchesObjectives = tool.learningObjectives.some(
          obj => obj.title.toLowerCase().includes(q) || obj.description.toLowerCase().includes(q)
        );

        if (
          !matchesName &&
          !matchesShortName &&
          !matchesDesc &&
          !matchesExtended &&
          !matchesInspiration &&
          !matchesCategory &&
          !matchesCommand &&
          !matchesObjectives
        ) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Identifies any unmet prerequisite IDs for a target tool given a list of completed IDs.
   */
  public findUnmetPrerequisites(
    toolId: string,
    completedIds: readonly string[]
  ): readonly string[] {
    const tool = this.getTool(toolId);
    if (!tool) return [];
    return tool.prerequisites.filter(p => !completedIds.includes(p));
  }

  /**
   * Resolves the list of related tools for a target tool.
   */
  public getRelatedTools(toolId: string): readonly CyberToolDefinition[] {
    const tool = this.getTool(toolId);
    if (!tool) return [];
    return tool.relatedToolIds
      .map(id => this.getTool(id))
      .filter((t): t is CyberToolDefinition => t !== undefined);
  }

  /**
   * Validates the integrity of all registered tools and checks for missing cross-references.
   */
  public validateRegistry(): RegistryValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingReferences: { toolId: string; missingRelatedToolId: string }[] = [];

    const allTools = this.getAllTools();

    for (const tool of allTools) {
      // 1. Mandatory field validations
      if (!tool.name.trim()) errors.push(`Tool '${tool.id}' has empty name.`);
      if (!tool.shortName.trim()) errors.push(`Tool '${tool.id}' has empty shortName.`);
      if (!tool.description.trim()) errors.push(`Tool '${tool.id}' has empty description.`);
      if (!tool.learningObjectives || tool.learningObjectives.length === 0) {
        warnings.push(`Tool '${tool.id}' declares no learning objectives.`);
      }

      // 2. Playable status verification
      if (tool.status === 'playable') {
        if (!tool.completionEvidenceRequired) {
          errors.push(`Playable tool '${tool.id}' must declare completionEvidenceRequired.`);
        }
      }

      // 3. Command spec checks for terminal tools
      if (tool.interfaceMode === 'terminal' || tool.interfaceMode === 'both') {
        if (!tool.commandSpec) {
          warnings.push(`Tool '${tool.id}' supports terminal mode but provides no commandSpec.`);
        }
      }

      // 4. Cross-reference checks
      for (const relId of tool.relatedToolIds) {
        if (!this.toolsById.has(relId)) {
          missingReferences.push({ toolId: tool.id, missingRelatedToolId: relId });
          warnings.push(
            `Tool '${tool.id}' references relatedToolId '${relId}', which is not registered in CyberArsenalRegistry.`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      totalTools: allTools.length,
      errors,
      warnings,
      missingReferences,
    };
  }
}

/**
 * Authoritative global singleton registry instance.
 */
export const GLOBAL_CYBER_ARSENAL_REGISTRY = new CyberArsenalRegistry();
