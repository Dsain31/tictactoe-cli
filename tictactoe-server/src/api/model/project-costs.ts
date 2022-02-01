export class ProjectCosts {
  projectName: string;
  projectCostsOptions: { duration: number; costs: number }[];
  constructor(obj: ProjectCostsType) {
    this.projectName = obj.projectName;
    this.projectCostsOptions = obj.projectCostsOptions;
  }
}

export type ProjectCostsType = ProjectCosts;