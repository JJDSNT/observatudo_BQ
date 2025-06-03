// lib/analytics/query.ts
import { bigQueryClient } from "./client";

type Dimension = {
  name: string;
  sql: string;
  type?: "string" | "number" | "date" | "boolean";
};

type Measure = {
  name: string;
  sql: string;
  type: "sum" | "count" | "avg" | "min" | "max" | "countDistinct";
};

type Filter = {
  dimension: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "IN" | "NOT IN" | "CONTAINS";
  values: unknown[];
};

export class QueryBuilder {
  private dimensions: Dimension[] = [];
  private measures: Measure[] = [];
  private filters: Filter[] = [];
  private sourceTable: string;
  private sourceAlias?: string;
  private joins: string[] = [];
  private limitValue: number = 1000;
  private orderByFields: { field: string; direction: "ASC" | "DESC" }[] = [];

  constructor(sourceTable: string, alias?: string) {
    this.sourceTable = sourceTable;
    this.sourceAlias = alias;
  }

  addDimension(dimension: Dimension) {
    this.dimensions.push(dimension);
    return this;
  }

  addMeasure(measure: Measure) {
    this.measures.push(measure);
    return this;
  }

  filter(filter: Filter) {
    this.filters.push(filter);
    return this;
  }

  join(table: string, alias: string, condition: string) {
    let fullTableName: string;
    if (table.includes(".")) {
      // Se table já tem pontos, assumir que é o nome completo
      fullTableName = `\`${table}\``;
    } else {
      // Caso contrário, construir o nome completo
      fullTableName = `\`${bigQueryClient.projectId}.${bigQueryClient.dataset}.${table}\``;
    }
    this.joins.push(`LEFT JOIN ${fullTableName} ${alias} ON ${condition}`);
    return this;
  }

  limit(limit: number) {
    this.limitValue = limit;
    return this;
  }

  orderBy(field: string, direction: "ASC" | "DESC" = "ASC") {
    this.orderByFields.push({ field, direction });
    return this;
  }

  buildQuery(): string {
    try {
      const selectClauses = [
        ...this.dimensions.map((d) => `${d.sql} AS ${d.name}`),
        ...this.measures.map((m) => `${this._getMeasureSql(m)} AS ${m.name}`),
      ];

      const whereClause = this._buildWhereClause();
      const groupByClause =
        this.dimensions.length > 0
          ? `GROUP BY ${this.dimensions.map((_, i) => i + 1).join(", ")}`
          : "";

      const orderByClause =
        this.orderByFields.length > 0
          ? `ORDER BY ${this.orderByFields
              .map((o) => `${o.field} ${o.direction}`)
              .join(", ")}`
          : "";

      const joinsClause =
        this.joins.length > 0 ? this.joins.join("\n        ") : "";

      let fullTableName: string;
      if (this.sourceTable.includes(".")) {
        fullTableName = `\`${this.sourceTable}\``;
      } else {
        fullTableName = `\`${bigQueryClient.projectId}.${bigQueryClient.dataset}.${this.sourceTable}\``;
      }
      const tableWithAlias = this.sourceAlias
        ? `${fullTableName} ${this.sourceAlias}`
        : fullTableName;

      const query = `
        SELECT 
          ${selectClauses.join(",\n          ")}
        FROM 
          ${tableWithAlias}
        ${joinsClause ? `\n        ${joinsClause}` : ""}
        ${whereClause}
        ${groupByClause}
        ${orderByClause}
        LIMIT ${this.limitValue}
      `.trim();

      console.log("Query gerada:", query);
      return query;
    } catch (error) {
      console.error("Erro ao construir query:", error);
      throw error;
    }
  }

  private _getMeasureSql(measure: Measure): string {
    switch (measure.type) {
      case "sum":
        return `SUM(${measure.sql})`;
      case "avg":
        return `AVG(${measure.sql})`;
      case "min":
        return `MIN(${measure.sql})`;
      case "max":
        return `MAX(${measure.sql})`;
      case "count":
        return `COUNT(${measure.sql})`;
      case "countDistinct":
        return `COUNT(DISTINCT ${measure.sql})`;
      default:
        return measure.sql;
    }
  }

  private _buildWhereClause(): string {
    if (this.filters.length === 0) return "";

    const conditions = this.filters.map((filter) => {
      const { dimension, operator, values } = filter;
      const dimensionObj = this.dimensions.find((d) => d.name === dimension);
      const dimensionSql = dimensionObj ? dimensionObj.sql : dimension;

      switch (operator) {
        case "IN":
          return `${dimensionSql} IN (${values
            .map((v) => (typeof v === "string" ? `'${v}'` : v))
            .join(", ")})`;
        case "NOT IN":
          return `${dimensionSql} NOT IN (${values
            .map((v) => (typeof v === "string" ? `'${v}'` : v))
            .join(", ")})`;
        case "CONTAINS":
          return `CONTAINS(${dimensionSql}, '${values[0]}')`;
        default:
          return `${dimensionSql} ${operator} ${
            typeof values[0] === "string" ? `'${values[0]}'` : values[0]
          }`;
      }
    });

    return `WHERE ${conditions.join(" AND ")}`;
  }

  async execute<T = Record<string, unknown>>(): Promise<T[]> {
    try {
      const query = this.buildQuery();
      return (await bigQueryClient.executeQuery(query)) as T[];
    } catch (error) {
      console.error("Erro ao executar query:", error);
      throw error;
    }
  }
}
