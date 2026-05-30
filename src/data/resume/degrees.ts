export interface Degree {
  school: string;
  degree: string;
  link: string;
  year: number;
}

const degrees: Degree[] = [
  {
    school: 'National University of Singapore (NUS)',
    degree: 'Bachelor of Computing (Computer Science)',
    link: 'https://www.comp.nus.edu.sg/',
    year: 2028,
  },
  {
    school: 'Raffles Junior College',
    degree: 'GCE A-Levels (PCME)',
    link: 'https://www.ri.edu.sg/',
    year: 2021,
  },
  {
    school: 'Raffles Institution',
    degree: 'Integrated Programme (IP)',
    link: 'https://www.ri.edu.sg/',
    year: 2019,
  },
  {
    school: 'Catholic High School',
    degree: 'Primary School Leaving Examination (PSLE)',
    link: 'https://www.catholichigh.moe.edu.sg/',
    year: 2015,
  },
];

export default degrees;
