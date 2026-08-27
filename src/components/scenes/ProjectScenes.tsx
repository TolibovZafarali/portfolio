import type { StructuralProject } from "../../content/portfolio";
import { PlaneArtwork } from "../artwork/PlaneArtwork";
import { RouteArtwork } from "../artwork/RouteArtwork";
import { TypeArtwork } from "../artwork/TypeArtwork";
import { SceneLabel } from "./SceneLabel";

export function PlaneScene({ project }: { readonly project: StructuralProject }) {
  return (
    <section
      className="project-scene project-scene--plane scene"
      id={project.id}
      data-scene={project.id}
      aria-labelledby={`${project.id}-title`}
    >
      <div className="scene__pin">
        <SceneLabel
          index={project.index}
          label={project.label}
          descriptor={project.descriptor}
          headingId={`${project.id}-title`}
          tone="carbon"
        />
        <PlaneArtwork mediaLabel={project.mediaLabel} />
      </div>
    </section>
  );
}

export function TypeScene({ project }: { readonly project: StructuralProject }) {
  return (
    <section
      className="project-scene project-scene--type scene"
      id={project.id}
      data-scene={project.id}
      aria-labelledby={`${project.id}-title`}
    >
      <div className="scene__pin">
        <SceneLabel
          index={project.index}
          label={project.label}
          descriptor={project.descriptor}
          headingId={`${project.id}-title`}
          tone="carbon"
        />
        <TypeArtwork mediaLabel={project.mediaLabel} />
      </div>
    </section>
  );
}

export function RouteScene({ project }: { readonly project: StructuralProject }) {
  return (
    <section
      className="project-scene project-scene--route scene"
      id={project.id}
      data-scene={project.id}
      aria-labelledby={`${project.id}-title`}
    >
      <div className="scene__pin">
        <SceneLabel
          index={project.index}
          label={project.label}
          descriptor={project.descriptor}
          headingId={`${project.id}-title`}
          tone="carbon"
        />
        <RouteArtwork mediaLabel={project.mediaLabel} />
      </div>
    </section>
  );
}
