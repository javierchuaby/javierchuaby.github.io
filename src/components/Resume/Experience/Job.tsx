import dayjs from 'dayjs';

import type { Position } from '@/data/resume/work';

import JobSummary from './JobSummary';

interface JobProps {
  data: Position;
}

export default function Job({ data }: JobProps) {
  const {
    name,
    position,
    url,
    startDate,
    endDate,
    summary,
    highlights,
    employmentType,
  } = data;

  return (
    <article className="jobs-container">
      <header>
        <h4>
          <a href={url}>{name}</a>
        </h4>
        <span className="role">{position}</span>
        <p className="daterange">
          {' '}
          <time dateTime={startDate}>
            {dayjs(startDate).format('MMMM YYYY')}
          </time>{' '}
          -{' '}
          {endDate ? (
            <time dateTime={endDate}>{dayjs(endDate).format('MMMM YYYY')}</time>
          ) : (
            'Present'
          )}
          {employmentType ? `\u00A0\u00A0•\u00A0\u00A0${employmentType}` : null}
        </p>
      </header>
      {summary ? <JobSummary summary={summary} /> : null}
      {highlights ? (
        <ul className="points">
          {highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
