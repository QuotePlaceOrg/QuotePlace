// StoicBare data — frontend-only seed.
// All quotes are short, widely-attributed public-domain sayings from long-dead
// authors. No modern / living authors. No invented quotes.
// Firestore-ready shape: id, text, authorId, topics[], source, language.
// TODO: replace this static seed with Firestore `quotes` collection reads.

export type Quote = {
  id: string;
  text: string;
  authorId: string;
  topics: string[];
  source: string;
  language: string;
};

export type Author = {
  id: string;
  name: string;
  epithet: string;
  lifespan: string;
  bio: string;
};

export type Topic = { slug: string; name: string; description: string };

export const AUTHORS: Author[] = [
  { id: "marcus-aurelius", name: "Marcus Aurelius", epithet: "Roman Emperor & Philosopher", lifespan: "121 – 180 AD", bio: "Last of the Five Good Emperors. His private journal, the Meditations, is the most intimate record of Stoic practice we have." },
  { id: "seneca", name: "Seneca the Younger", epithet: "Philosopher, Statesman, Playwright", lifespan: "c. 4 BC – 65 AD", bio: "Roman Stoic philosopher and statesman. His letters and essays on anger, time, and providence remain foundational Stoic reading." },
  { id: "epictetus", name: "Epictetus", epithet: "Freed Slave & Teacher", lifespan: "c. 50 – 135 AD", bio: "Born enslaved, later a celebrated teacher in Nicopolis. His Discourses and Enchiridion teach the dichotomy of control." },
  { id: "zeno", name: "Zeno of Citium", epithet: "Founder of Stoicism", lifespan: "c. 334 – 262 BC", bio: "Merchant turned philosopher who founded Stoicism in Athens, teaching at the Painted Porch." },
  { id: "cleanthes", name: "Cleanthes", epithet: "Stoic Philosopher", lifespan: "c. 330 – 230 BC", bio: "Second head of the Stoic school after Zeno. Known for his Hymn to Zeus and his teaching on fate and acceptance." },
  { id: "buddha", name: "Buddha", epithet: "Founder of Buddhism", lifespan: "c. 563 – 483 BC", bio: "Siddhartha Gautama, whose teachings on suffering, mindfulness, and compassion shaped much of Asian thought." },
  { id: "confucius", name: "Confucius", epithet: "Chinese Philosopher", lifespan: "551 – 479 BC", bio: "Chinese teacher whose Analects shaped ethics, education, and government across East Asia for two thousand years." },
  { id: "lao-tzu", name: "Lao Tzu", epithet: "Founder of Taoism", lifespan: "c. 6th century BC", bio: "Traditionally credited with the Tao Te Ching, a short text on simplicity, nature, and effortless action." },
  { id: "shakespeare", name: "William Shakespeare", epithet: "Playwright & Poet", lifespan: "1564 – 1616", bio: "English playwright and poet whose plays and sonnets remain among the most quoted works in English." },
  { id: "aristotle", name: "Aristotle", epithet: "Greek Philosopher", lifespan: "384 – 322 BC", bio: "Student of Plato and teacher of Alexander. His works cover logic, ethics, politics, and natural science." },
  { id: "plato", name: "Plato", epithet: "Greek Philosopher", lifespan: "c. 428 – 348 BC", bio: "Student of Socrates and founder of the Academy. His dialogues shaped Western philosophy." },
  { id: "socrates", name: "Socrates", epithet: "Greek Philosopher", lifespan: "c. 470 – 399 BC", bio: "Athenian philosopher known through Plato's dialogues. He taught by questioning and lived by examined principles." },
  { id: "heraclitus", name: "Heraclitus", epithet: "Greek Philosopher", lifespan: "c. 535 – 475 BC", bio: "Presocratic philosopher of change and flux, known for the image of the ever-changing river." },
  { id: "diogenes", name: "Diogenes", epithet: "Cynic Philosopher", lifespan: "c. 412 – 323 BC", bio: "Cynic philosopher famous for radical simplicity, frank speech, and living in a barrel in Corinth." },
  { id: "cicero", name: "Cicero", epithet: "Roman Statesman & Orator", lifespan: "106 – 43 BC", bio: "Roman orator and statesman whose letters and treatises carried Greek philosophy into Latin." },
  { id: "aesop", name: "Aesop", epithet: "Storyteller", lifespan: "c. 620 – 564 BC", bio: "Traditionally credited with the fables that teach practical wisdom through short animal stories." },
];

export const TOPICS: Topic[] = [
  { slug: "wisdom", name: "Wisdom", description: "Seeing clearly, judging well, and knowing what matters." },
  { slug: "virtue", name: "Virtue", description: "Character, honesty, and doing the right thing." },
  { slug: "discipline", name: "Discipline", description: "Doing what must be done, even when it is hard." },
  { slug: "resilience", name: "Resilience", description: "Rising after a fall and enduring difficulty." },
  { slug: "time", name: "Time", description: "How we spend the hours we are given." },
  { slug: "anger", name: "Anger", description: "Mastering anger instead of being mastered by it." },
  { slug: "death", name: "Death", description: "Facing mortality with clarity and calm." },
  { slug: "fate", name: "Fate", description: "Accepting what we cannot control." },
  { slug: "courage", name: "Courage", description: "Acting rightly despite fear." },
  { slug: "self-knowledge", name: "Self-Knowledge", description: "Knowing yourself before judging others." },
  { slug: "love", name: "Love", description: "Kindness, affection, and care for others." },
  { slug: "life", name: "Life", description: "How to live a good and meaningful life." },
];

export const QUOTES: Quote[] = [
  // Marcus Aurelius
  { id: "q01", text: "Waste no more time arguing what a good man should be. Be one.", authorId: "marcus-aurelius", topics: ["virtue"], source: "Meditations", language: "en" },
  { id: "q02", text: "You have power over your mind — not outside events. Realize this, and you will find strength.", authorId: "marcus-aurelius", topics: ["resilience", "self-knowledge"], source: "Meditations", language: "en" },
  { id: "q03", text: "The happiness of your life depends upon the quality of your thoughts.", authorId: "marcus-aurelius", topics: ["wisdom", "life"], source: "Meditations", language: "en" },
  { id: "q04", text: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.", authorId: "marcus-aurelius", topics: ["life", "wisdom"], source: "Meditations", language: "en" },
  // Seneca
  { id: "q05", text: "We suffer more often in imagination than in reality.", authorId: "seneca", topics: ["resilience", "wisdom"], source: "Letters to Lucilius", language: "en" },
  { id: "q06", text: "Luck is what happens when preparation meets opportunity.", authorId: "seneca", topics: ["wisdom", "life"], source: "Attributed", language: "en" },
  { id: "q07", text: "It is not the man who has too little, but the man who craves more, that is poor.", authorId: "seneca", topics: ["virtue", "life"], source: "Letters to Lucilius", language: "en" },
  { id: "q08", text: "No man is free who is not master of himself.", authorId: "seneca", topics: ["discipline", "self-knowledge"], source: "Letters to Lucilius", language: "en" },
  // Epictetus
  { id: "q09", text: "First say to yourself what you would be; and then do what you have to do.", authorId: "epictetus", topics: ["discipline", "virtue"], source: "Discourses", language: "en" },
  { id: "q10", text: "It is not what happens to you, but how you react to it that matters.", authorId: "epictetus", topics: ["resilience", "fate"], source: "Enchiridion", language: "en" },
  { id: "q11", text: "If you want to improve, be content to be thought foolish and stupid.", authorId: "epictetus", topics: ["discipline", "self-knowledge"], source: "Discourses", language: "en" },
  { id: "q12", text: "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.", authorId: "epictetus", topics: ["fate", "wisdom"], source: "Discourses", language: "en" },
  // Zeno + Cleanthes
  { id: "q13", text: "We have two ears and one mouth, so we should listen more than we say.", authorId: "zeno", topics: ["wisdom"], source: "Attributed", language: "en" },
  { id: "q14", text: "Better to trip with the feet than with the tongue.", authorId: "zeno", topics: ["wisdom", "virtue"], source: "Attributed", language: "en" },
  { id: "q15", text: "Fate guides the willing, and drags the unwilling.", authorId: "cleanthes", topics: ["fate"], source: "Attributed", language: "en" },
  { id: "q16", text: "Lead me, O Zeus, and thou, O Destiny, to whatever station you have assigned me.", authorId: "cleanthes", topics: ["fate"], source: "Hymn to Zeus", language: "en" },
  // Buddha
  { id: "q17", text: "The mind is everything. What you think, you become.", authorId: "buddha", topics: ["wisdom", "self-knowledge"], source: "Dhammapada", language: "en" },
  { id: "q18", text: "Peace comes from within. Do not seek it without.", authorId: "buddha", topics: ["life", "wisdom"], source: "Attributed", language: "en" },
  { id: "q19", text: "Three things cannot be long hidden: the sun, the moon, and the truth.", authorId: "buddha", topics: ["virtue", "wisdom"], source: "Attributed", language: "en" },
  { id: "q20", text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", authorId: "buddha", topics: ["time", "wisdom"], source: "Attributed", language: "en" },
  // Confucius
  { id: "q21", text: "Everything has beauty, but not everyone sees it.", authorId: "confucius", topics: ["wisdom", "life"], source: "Analects", language: "en" },
  { id: "q22", text: "It does not matter how slowly you go as long as you do not stop.", authorId: "confucius", topics: ["discipline", "resilience"], source: "Analects", language: "en" },
  { id: "q23", text: "Our greatest glory is not in never falling, but in rising every time we fall.", authorId: "confucius", topics: ["resilience"], source: "Analects", language: "en" },
  { id: "q24", text: "Choose a job you love, and you will never have to work a day in your life.", authorId: "confucius", topics: ["life", "wisdom"], source: "Attributed", language: "en" },
  // Lao Tzu
  { id: "q25", text: "The journey of a thousand miles begins with a single step.", authorId: "lao-tzu", topics: ["discipline", "life"], source: "Tao Te Ching", language: "en" },
  { id: "q26", text: "Nature does not hurry, yet everything is accomplished.", authorId: "lao-tzu", topics: ["time", "life"], source: "Tao Te Ching", language: "en" },
  { id: "q27", text: "He who knows others is wise; he who knows himself is enlightened.", authorId: "lao-tzu", topics: ["self-knowledge", "wisdom"], source: "Tao Te Ching", language: "en" },
  { id: "q28", text: "When I let go of what I am, I become what I might be.", authorId: "lao-tzu", topics: ["self-knowledge", "life"], source: "Tao Te Ching", language: "en" },
  // Shakespeare
  { id: "q29", text: "To be, or not to be, that is the question.", authorId: "shakespeare", topics: ["life", "death"], source: "Hamlet", language: "en" },
  { id: "q30", text: "All the world's a stage, and all the men and women merely players.", authorId: "shakespeare", topics: ["life"], source: "As You Like It", language: "en" },
  { id: "q31", text: "Love all, trust a few, do wrong to none.", authorId: "shakespeare", topics: ["love", "virtue"], source: "All's Well That Ends Well", language: "en" },
  { id: "q32", text: "This above all: to thine own self be true.", authorId: "shakespeare", topics: ["self-knowledge", "virtue"], source: "Hamlet", language: "en" },
  // Aristotle
  { id: "q33", text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", authorId: "aristotle", topics: ["discipline", "virtue"], source: "Nicomachean Ethics", language: "en" },
  { id: "q34", text: "Knowing yourself is the beginning of all wisdom.", authorId: "aristotle", topics: ["self-knowledge", "wisdom"], source: "Attributed", language: "en" },
  { id: "q35", text: "The whole is greater than the sum of its parts.", authorId: "aristotle", topics: ["wisdom"], source: "Metaphysics", language: "en" },
  { id: "q36", text: "Patience is bitter, but its fruit is sweet.", authorId: "aristotle", topics: ["discipline", "time"], source: "Attributed", language: "en" },
  // Plato
  { id: "q37", text: "The first and greatest victory is to conquer yourself.", authorId: "plato", topics: ["discipline", "self-knowledge"], source: "Laws", language: "en" },
  { id: "q38", text: "Courage is knowing what not to fear.", authorId: "plato", topics: ["courage", "wisdom"], source: "Attributed", language: "en" },
  { id: "q39", text: "The beginning is the most important part of the work.", authorId: "plato", topics: ["discipline", "life"], source: "Republic", language: "en" },
  { id: "q40", text: "Wise men speak because they have something to say; fools because they have to say something.", authorId: "plato", topics: ["wisdom"], source: "Attributed", language: "en" },
  // Socrates
  { id: "q41", text: "The unexamined life is not worth living.", authorId: "socrates", topics: ["self-knowledge", "life"], source: "Apology", language: "en" },
  { id: "q42", text: "I know that I know nothing.", authorId: "socrates", topics: ["wisdom", "self-knowledge"], source: "Apology", language: "en" },
  { id: "q43", text: "Wonder is the beginning of wisdom.", authorId: "socrates", topics: ["wisdom"], source: "Theaetetus", language: "en" },
  { id: "q44", text: "I cannot teach anybody anything. I can only make them think.", authorId: "socrates", topics: ["wisdom"], source: "Attributed", language: "en" },
  // Heraclitus
  { id: "q45", text: "No man ever steps in the same river twice.", authorId: "heraclitus", topics: ["time", "life"], source: "Fragments", language: "en" },
  { id: "q46", text: "Change is the only constant.", authorId: "heraclitus", topics: ["time", "fate"], source: "Fragments", language: "en" },
  { id: "q47", text: "Character is destiny.", authorId: "heraclitus", topics: ["virtue", "fate"], source: "Fragments", language: "en" },
  { id: "q48", text: "Much learning does not teach understanding.", authorId: "heraclitus", topics: ["wisdom", "self-knowledge"], source: "Fragments", language: "en" },
  // Diogenes
  { id: "q49", text: "I am a citizen of the world.", authorId: "diogenes", topics: ["life", "virtue"], source: "Attributed", language: "en" },
  { id: "q50", text: "The foundation of every state is the education of its youth.", authorId: "diogenes", topics: ["virtue", "wisdom"], source: "Attributed", language: "en" },
  { id: "q51", text: "The art of being a slave is to rule one's master.", authorId: "diogenes", topics: ["wisdom", "life"], source: "Attributed", language: "en" },
  { id: "q52", text: "Stand a little out of my sun.", authorId: "diogenes", topics: ["virtue", "life"], source: "Attributed", language: "en" },
  // Cicero
  { id: "q53", text: "A room without books is like a body without a soul.", authorId: "cicero", topics: ["wisdom", "life"], source: "Attributed", language: "en" },
  { id: "q54", text: "Gratitude is not only the greatest of virtues, but the parent of all others.", authorId: "cicero", topics: ["virtue", "love"], source: "Pro Plancio", language: "en" },
  { id: "q55", text: "The life of the dead is placed in the memory of the living.", authorId: "cicero", topics: ["death", "life"], source: "Philippics", language: "en" },
  { id: "q56", text: "If you have a garden and a library, you have everything you need.", authorId: "cicero", topics: ["life", "wisdom"], source: "Attributed", language: "en" },
  // Aesop
  { id: "q57", text: "No act of kindness, no matter how small, is ever wasted.", authorId: "aesop", topics: ["love", "virtue"], source: "Aesop's Fables", language: "en" },
  { id: "q58", text: "United we stand, divided we fall.", authorId: "aesop", topics: ["virtue", "life"], source: "Aesop's Fables", language: "en" },
  { id: "q59", text: "Slow and steady wins the race.", authorId: "aesop", topics: ["discipline", "resilience"], source: "The Tortoise and the Hare", language: "en" },
  { id: "q60", text: "A crust eaten in peace is better than a banquet partaken in anxiety.", authorId: "aesop", topics: ["life", "wisdom"], source: "Aesop's Fables", language: "en" },
];

export function getAuthor(id: string) { return AUTHORS.find((a) => a.id === id); }
export function getQuote(id: string) { return QUOTES.find((q) => q.id === id); }
export function quotesByAuthor(authorId: string) { return QUOTES.filter((q) => q.authorId === authorId); }
export function quotesByTopic(slug: string) { return QUOTES.filter((q) => q.topics.includes(slug)); }
export function getTopic(slug: string) { return TOPICS.find((t) => t.slug === slug); }
export function quoteCountForAuthor(authorId: string) { return quotesByAuthor(authorId).length; }

// Deterministic Quote of the Day: day-of-year % QUOTES.length
export function quoteOfTheDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return QUOTES[day % QUOTES.length];
}
