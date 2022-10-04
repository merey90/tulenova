import { Container, Box } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { IBlog, BlogItem } from './blogItem';

export const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Array<IBlog>>([]);

  useEffect(() => {
    const getBlogs = async () => {
      try {
        const blogs = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F%40meruyerttulenova'
        );
        const { items } = await blogs.json();
        setBlogs(items || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('error: ', error);
      }
    };
    getBlogs();
  }, []);

  return (
    <div className="projects-wrapper">
      <Container>
        <Box marginBottom={40} />
        <Box className="projects-backdrop">
          {blogs.map((blog) => (
            <BlogItem key={blog.guid} {...blog} />
          ))}
        </Box>
      </Container>
    </div>
  );
};
