import { Link } from 'react-router-dom';
import { currency } from '../utils/format.js';

export function CourseCard({ course, onAdd, busy = false }) {
  return (
    <article className="course-card">
      <img src={course.image} alt={`${course.title} course`} />
      <div>
        <span className="tag">{course.category?.name || 'Course'}</span>
        <h3>{course.title}</h3>
        <p>{course.shortDescription}</p>
        <div className="meta">
          <span>{course.durationWeeks} weeks</span>
          <span>{course.level}</span>
          <span>{currency.format(course.fee)}</span>
        </div>
        <div className="card-actions">
          <Link to={`/courses/${course.slug}`} className="small-link">View details</Link>
          {onAdd ? (
            <button className="btn compact primary" type="button" onClick={() => onAdd(course)} disabled={busy || course.availableSeats < 1}>
              {course.availableSeats < 1 ? 'Fully booked' : busy ? 'Adding…' : 'Add to basket'}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
