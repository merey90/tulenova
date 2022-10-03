import { useEffect, useState } from 'react';
import { Paper, Tab, Tabs } from '@material-ui/core';
import { useParams, Link, Routes, Route } from 'react-router-dom';

import { Photos } from './photos';
import { Videos } from './videos';
import { Audios } from './audios';

export const Media: React.FC = () => {
  const [tab, setTab] = useState('photos');

  const handleTabChange = (event: React.ChangeEvent<Record<string, never>>, newTab: string) => {
    setTab(newTab);
  };

  return (
    <>
      <Paper>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" indicatorColor="secondary" textColor="inherit">
          <Tab component={Link} label="Photos" to="photos" value="photos" />
          <Tab component={Link} label="Repertoire" to="repertoire" value="repertoire" />
          <Tab component={Link} label="Videos" to="videos" value="videos" />
          <Tab component={Link} label="Audios" to="audios" value="audios" />
        </Tabs>
      </Paper>
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
  };

  const selectedComponent = components[mediaTab];

  return <>{selectedComponent}</>;
};
