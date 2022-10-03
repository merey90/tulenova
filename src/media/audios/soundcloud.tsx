interface ISoundCloud {
  link: string;
}

export const SoundCloud: React.FC<ISoundCloud> = ({ link }) => {
  return (
    <>
      <iframe width="100%" height="500" scrolling="no" frameBorder="no" allow="autoplay" src={link} />
    </>
  );
};
