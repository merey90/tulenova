interface ISoundCloud {
  link: string;
}

export const SoundCloud: React.FC<ISoundCloud> = ({ link }) => {
  return (
    <div className="soundcloud-embed">
      <iframe
        width="100%"
        height="450"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={link}
        title="SoundCloud"
      />
    </div>
  );
};
