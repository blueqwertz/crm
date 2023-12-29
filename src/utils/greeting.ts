export function generateGreeting(username: string): string {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const dayOfWeek = currentTime.getDay();

  let greeting = "";

  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    if (currentHour >= 5 && currentHour < 12) {
      greeting = `Good Morning, ${username}`;
    } else if (currentHour >= 12 && currentHour < 18) {
      greeting = `Good Afternoon, ${username}`;
    } else {
      greeting = `Good Evening, ${username}`;
    }
  } else {
    greeting = `Have a nice weekend, ${username}`;
  }

  return greeting;
}
