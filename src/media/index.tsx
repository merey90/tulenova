import { useEffect, useState } from 'react';
import { Box, Tab, Tabs } from '@material-ui/core';
import { useParams, Link, Routes, Route } from 'react-router-dom';

import { Photos } from './photos';
import { Videos } from './videos';
import { Audios } from './audios';
import { Repertoire } from './repertoire';

import './styles.scss';

export const Media: React.FC = () => {
  const [tab, setTab] = useState('photos');

  const handleTabChange = (event: React.ChangeEvent<Record<string, never>>, newTab: string) => {
    setTab(newTab);
  };

  return (
    <>
      <Box marginBottom={2}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="secondary"
          textColor="secondary"
          centered
          className="media-tabs"
        >
          <Tab component={Link} label="Photos" to="photos" value="photos" />
          <Tab component={Link} label="Videos" to="videos" value="videos" />
          <Tab component={Link} label="Audios" to="audios" value="audios" />
          <Tab component={Link} label="Repertoire" to="repertoire" value="repertoire" />
        </Tabs>
      </Box>
      <Routes>
        <Route path=":mediaTab/*" element={<MediaContent setTab={setTab} />} />
      </Routes>
    </>
  );
};

interface IMediaContent {
  setTab: React.Dispatch<React.SetStateAction<string>>;
}

const MediaContent: React.FC<IMediaContent> = ({ setTab }) => {
  const { mediaTab = 'photos' } = useParams();
  useEffect(() => {
    setTab(mediaTab);
  }, [mediaTab, setTab]);

  const components: { [key: string]: JSX.Element } = {
    photos: <Photos />,
    videos: <Videos />,
    audios: <Audios />,
    repertoire: <Repertoire />,
  };

  const selectedComponent = components[mediaTab];

  return <>{selectedComponent}</>;
};
