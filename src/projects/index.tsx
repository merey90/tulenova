import { Container, Box, Hidden } from '@material-ui/core';
import { IProject, ProjectItem } from './projectItem';

const projects: Array<IProject> = [
  {
    title: '​ARTISTS OF MODERN KAZAKHSTAN',
    description: 'Project manager, Research institute of culture of the Ministry of culture of Kazakhstan',
    link: 'https://www.centralasiaprogram.org/artists-modern-kazakhstan',
  },
  {
    title: 'MUSEOLOG',
    description: 'Researcher, Museums association of the Culture Department of Almaty',
    link: 'https://studylib.ru/doc/151478/museolog-rukovodstvo-pol._zovatelya-programma-po-sozdaniyu-i%E2%80%A6',
  },
  {
    title: '3D VISUAL MAP OF KAZAKHSTAN',
    description: 'Researcher, research institute of culture of the Ministry of culture of Kazakhstan',
    link: 'https://3d-maps.kz/en',
  },
  {
    title: 'Intangible heritage - Culture sector - UNESCO',
    description: 'Researcher, member of Comission',
    link: 'https://ich.unesco.org/en/state/kazakhstan-KZ',
  },
  {
    title: 'Cultural heritage monuments of Almaty',
    description: 'Researcher, Museum association of the Culture Department of Almaty',
    link: 'https://commons.wikimedia.org/wiki/Category:Cultural_heritage_monuments_in_Almaty',
  },
  {
    title: 'RE:SOUND Central Asia 2024-2025',
    description: 'Curator',
    link: 'https://arttech.garden',
  },
];

export const Projects: React.FC = () => {
  return (
    <div className="projects-wrapper">
      <Container>
        <Hidden xsDown>
          <Box marginBottom={40} />
        </Hidden>
        <Box mt={2} className="projects-backdrop">
          <p className="projects-header">
            Parallel to her musical career, Mira has contributed to the cultural policy of Kazakhstan and the
            preservation of the cultural heritage of Central Asia. Since 2012, she has worked as a researcher, culture
            expert, and project manager for the Research Institute of Culture, UNESCO Central Asia, Association of
            Museums, and the Ministry of Culture of Kazakhstan.
          </p>
          {projects.map((project) => (
            <ProjectItem key={project.title} {...project} />
          ))}
        </Box>
      </Container>
    </div>
  );
};
