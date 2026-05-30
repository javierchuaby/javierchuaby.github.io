import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons/faEnvelope';

export interface ContactItem {
  link: string;
  label: string;
  icon: IconDefinition;
}

const data: ContactItem[] = [
  {
    link: 'https://www.linkedin.com/in/javier-chua-bing-yan',
    label: 'LinkedIn',
    icon: faLinkedinIn,
  },
  {
    link: 'https://github.com/javierchuaby',
    label: 'Github',
    icon: faGithub,
  },
  // {
  //   link: 'https://x.com/javierchuaby',
  //   label: 'X',
  //   icon: faTwitter,
  // },
  {
    link: 'https://www.instagram.com/javierchuaby/',
    label: 'Instagram',
    icon: faInstagram,
  },
  {
    link: 'mailto:javierchuaby@gmail.com',
    label: 'Email',
    icon: faEnvelope,
  },
];

export default data;
