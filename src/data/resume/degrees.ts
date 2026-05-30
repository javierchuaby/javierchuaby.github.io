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
];

export default degrees;
