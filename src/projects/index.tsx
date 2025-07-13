import { Container, Box, Hidden } from '@material-ui/core';
import { IProject, ProjectItem } from './projectItem';

const projects: Array<IProject> = [
  {
    title: 'ArtTech Garden',
    description: 'Founder',
    link: 'https://arttech.garden',
  },
  {
    title: 'RE:SOUND Central Asia 2024-2025',
    description: 'Curator',
    link: 'https://arttech.garden',
  },
  {
    title: 'Artists of Modern Kazakhstan',
    description: 'Project Manager, Research Institute of Culture, Ministry of Culture of the Republic of Kazakhstan',
    link: 'https://centralasiaprogram.org/publications-all/voices-from-the-region/artists-of-modern-kazakhstan',
  },
  {
    title: 'Museolog',
    description: 'Researcher, Museums Association, Department of Culture of Almaty',
    link: 'https://studylib.ru/doc/151478/museolog-rukovodstvo-pol._zovatelya-programma-po-sozdaniyu-i%E2%80%A6',
  },
  {
    title: '3D Visual Map of Kazakhstan',
    description: 'Researcher, Research Institute of Culture, Ministry of Culture of the Republic of Kazakhstan',
    link: 'https://3d-maps.kz/en',
  },
  {
    title: 'Intangible Heritage – Culture Sector – UNESCO',
    description: 'Researcher, Member of the Commission for UNESCO',
    link: 'https://ich.unesco.org/en/state/kazakhstan-KZ',
  },
  {
    title: 'Cultural Heritage Monuments of Almaty',
    description: 'Researcher, Museums Association, Department of Culture of Almaty',
    link: 'https://commons.wikimedia.org/wiki/Category:Cultural_heritage_monuments_in_Almaty',
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
            Parallel to her musical career, Mira has been actively involved in shaping cultural policy and preserving
            the cultural heritage of Central Asia. Since 2012, she has worked as a researcher, cultural expert, and
            project manager with the Research Institute of Culture, UNESCO Central Asia, the Association of Museums, and
            the Ministry of Culture of the Republic of Kazakhstan.
          </p>
          {projects.map((project) => (
            <ProjectItem key={project.title} {...project} />
          ))}
        </Box>
      </Container>
    </div>
  );
};
