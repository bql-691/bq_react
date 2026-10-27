import { Link } from 'react-router';
import type { ProjectStore } from '../../domain/enum/project_store';
import type { Project } from '../../domain/entities/project';

export function ProjectRow({ project, store }: { project: Project; store: ProjectStore }) {
  return (
    <li className="project-row">
      <Link to={`/editor/${project.id}?store=${store}`}>{project.name}</Link>
    </li>
  );
}
