export type Email = {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string; // ISO string
  labels?: string[];
};

export type RuleCondition = {
  field: keyof Pick<Email, "from" | "to" | "subject" | "body">;
  match: "contains" | "startsWith" | "endsWith" | "regex" | "equals";
  value: string;
  caseSensitive?: boolean;
};

export type RuleAction = {
  type: "moveToFolder" | "addLabel" | "markImportant" | "markSpam";
  value?: string;
};

export type Rule = {
  id: string;
  name: string;
  enabled: boolean;
  any?: boolean; // if true, OR conditions, else AND
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority?: number; // higher runs first
};

export type SortResult = {
  emailId: string;
  matchedRules: string[];
  folders: string[];
  labels: string[];
  important: boolean;
  spam: boolean;
};

export type SortRequest = {
  emails: Email[];
  rules: Rule[];
};

export type SortResponse = {
  results: SortResult[];
};
