export interface Course {
  title: string;
  number: string;
  link: string;
  university: string;
}

const courses: Course[] = [
  {
    title: 'Operating Systems',
    number: 'CS2106',
    link: 'https://nusmods.com/courses/CS2106',
    university: 'NUS',
  },
  {
    title: 'Computer Networks',
    number: 'CS2105',
    link: 'https://nusmods.com/courses/CS2105',
    university: 'NUS',
  },
  {
    title: 'Database Systems',
    number: 'CS2102',
    link: 'https://nusmods.com/courses/CS2102',
    university: 'NUS',
  },
  {
    title: 'Machine Learning',
    number: 'CS2109S',
    link: 'https://nusmods.com/courses/CS3244',
    university: 'NUS',
  },
  {
    title: 'Computer Security',
    number: 'CS2107',
    link: 'https://nusmods.com/courses/CS3235',
    university: 'NUS',
  },
  {
    title: 'Software Engineering',
    number: 'CS2103T',
    link: 'https://nusmods.com/courses/CS2103T',
    university: 'NUS',
  },
];

export default courses;
