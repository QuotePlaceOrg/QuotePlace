/**
 * StoicBare — seed data.
 *
 * Self-contained snapshot of the AUTHORS + QUOTES arrays from
 * src/app/page.tsx, used by scripts/seed-quotes.mjs to populate
 * the Firestore 'quotes' + 'authors' collections.
 *
 * If you update src/app/page.tsx with new authors/quotes, re-run
 * the extract-seed-data.sh script (or copy the new entries here)
 * and re-run the seed — it overwrites by doc ID (idempotent).
 */

export const authors = [
    // — Stoic school —
    {
      id: "marcus-aurelius",
      name: "Marcus Aurelius",
      epithet: "Roman Emperor & Stoic Philosopher",
      lifespan: "121 – 180 AD",
      bio: "Last of the Five Good Emperors. His private journal, the Meditations, is the most intimate record of Stoic practice we have.",
    },
    {
      id: "seneca",
      name: "Seneca the Younger",
      epithet: "Stoic Philosopher, Statesman, Playwright",
      lifespan: "c. 4 BC – 65 AD",
      bio: "Tutor and advisor to Nero until forced to take his own life. His Epistulae Morales remain foundational Stoic reading.",
    },
    {
      id: "epictetus",
      name: "Epictetus",
      epithet: "Stoic Teacher, Freed Slave",
      lifespan: "c. 50 – 135 AD",
      bio: "Born a slave in the Eastern Empire. Taught in Nicopolis; the Enchiridion and Discourses were recorded by his student Arrian.",
    },
    {
      id: "musonius-rufus",
      name: "Musonius Rufus",
      epithet: "Stoic Teacher, Roman Knight",
      lifespan: "c. 20 – 101 AD",
      bio: "Called the 'Roman Socrates.' Teacher of Epictetus. Survived multiple exiles; fragments of his discourses survive via Stobaeus.",
    },
    {
      id: "cleanthes",
      name: "Cleanthes",
      epithet: "Second head of the Stoa",
      lifespan: "c. 330 – 230 BC",
      bio: "Succeeded Zeno as head of the Stoic school in Athens. His Hymn to Zeus is the most complete surviving Stoic poem.",
    },
    {
      id: "zeno",
      name: "Zeno of Citium",
      epithet: "Founder of Stoicism",
      lifespan: "c. 334 – 262 BC",
      bio: "Began teaching under the Stoa Poikilē — the Painted Porch of the Athenian agora — around 300 BC. The school's name derives from this colonnade.",
    },
    // — Greek philosophy —
    {
      id: "socrates",
      name: "Socrates",
      epithet: "Greek Philosopher",
      lifespan: "c. 470 – 399 BC",
      bio: "Wrote nothing himself; we know him through Plato, Xenophon, and Aristophanes. Condemned to drink hemlock for 'corrupting the youth' of Athens.",
    },
    {
      id: "plato",
      name: "Plato",
      epithet: "Greek Philosopher, Founder of the Academy",
      lifespan: "c. 428 – 348 BC",
      bio: "Student of Socrates, teacher of Aristotle. Founded the Academy in Athens — often called the first institution of higher learning in the West.",
    },
    {
      id: "aristotle",
      name: "Aristotle",
      epithet: "Greek Philosopher, Polymath",
      lifespan: "384 – 322 BC",
      bio: "Student of Plato, tutor to Alexander the Great. His Nicomachean Ethics and Metaphysics shaped Western thought for two millennia.",
    },
    // — Eastern traditions —
    {
      id: "confucius",
      name: "Confucius",
      epithet: "Chinese Philosopher, Teacher",
      lifespan: "551 – 479 BC",
      bio: "Itinerant teacher and political advisor in the Spring and Autumn period. The Analects record his conversations with disciples on ethics, ritual, and governance.",
    },
    {
      id: "lao-tzu",
      name: "Lao Tzu",
      epithet: "Semi-legendary Chinese Sage",
      lifespan: "6th c. BC (legendary)",
      bio: "Traditionally the author of the Tao Te Ching and a founder of Taoism. Historical existence debated; the text itself is undeniably ancient and influential.",
    },
    // — Roman non-Stoic —
    {
      id: "cicero",
      name: "Marcus Tullius Cicero",
      epithet: "Roman Statesman, Orator, Philosopher",
      lifespan: "106 – 43 BC",
      bio: "Rome's greatest orator. His letters and treatises — De Officiis, De Amicitia — transmitted Greek philosophy to the Latin West.",
    },
    // — Renaissance & early modern —
    {
      id: "montaigne",
      name: "Michel de Montaigne",
      epithet: "French Essayist, Philosopher",
      lifespan: "1533 – 1592",
      bio: "Inventor of the 'essay' as a literary form. His Essais explore the human condition with disarming self-skepticism — 'What do I know?'",
    },
    {
      id: "bacon",
      name: "Francis Bacon",
      epithet: "English Philosopher, Statesman",
      lifespan: "1561 – 1626",
      bio: "Father of empiricism. His Novum Organum argued for inductive reasoning over scholastic deduction, seeding the Scientific Revolution.",
    },
    // — Enlightenment —
    {
      id: "voltaire",
      name: "Voltaire",
      epithet: "French Enlightenment Writer",
      lifespan: "1694 – 1778",
      bio: "Pen name of François-Marie Arouet. Satirist, polemicist, and crusader against intolerance. His Dictionnaire Philosophique remains a quotable arsenal.",
    },
    {
      id: "franklin",
      name: "Benjamin Franklin",
      epithet: "American Polymath, Statesman",
      lifespan: "1706 – 1790",
      bio: "Printer, scientist, diplomat, and Founding Father. His Poor Richard's Almanack distilled practical wisdom into enduring aphorisms.",
    },
    {
      id: "kant",
      name: "Immanuel Kant",
      epithet: "German Philosopher",
      lifespan: "1724 – 1804",
      bio: "Synthesised rationalism and empiricism. The Critique of Pure Reason and the Critique of Practical Reason remain central to modern philosophy.",
    },
    // — American Transcendentalism —
    {
      id: "emerson",
      name: "Ralph Waldo Emerson",
      epithet: "American Essayist, Lecturer, Philosopher",
      lifespan: "1803 – 1882",
      bio: "Leader of the Transcendentalist movement. His essay 'Self-Reliance' remains a foundational text of American individualism.",
    },
    {
      id: "thoreau",
      name: "Henry David Thoreau",
      epithet: "American Naturalist, Writer",
      lifespan: "1817 – 1862",
      bio: "Transcendentalist. Walden (his two-year experiment at the pond) and 'Civil Disobedience' inspired both environmentalism and nonviolent resistance.",
    },
    // — Late 19th century —
    {
      id: "nietzsche",
      name: "Friedrich Nietzsche",
      epithet: "German Philosopher, Philologist",
      lifespan: "1844 – 1900",
      bio: "Proclaimed the 'death of God' and the coming of the Übermensch. His aphoristic style — Thus Spoke Zarathustra, Twilight of the Idols — conceals precision beneath poetry.",
    },
    {
      id: "tolstoy",
      name: "Leo Tolstoy",
      epithet: "Russian Novelist, Thinker",
      lifespan: "1828 – 1910",
      bio: "Author of War and Peace and Anna Karenina. In later life became a Christian anarchist and pacifist whose writings influenced Gandhi.",
    },
    // — Wits —
    {
      id: "twain",
      name: "Mark Twain",
      epithet: "American Novelist, Humorist",
      lifespan: "1835 – 1910",
      bio: "Pen name of Samuel Langhorne Clemens. 'The father of American literature,' per Faulkner. His aphorisms are as quoted as his novels.",
    },
    {
      id: "wilde",
      name: "Oscar Wilde",
      epithet: "Irish Poet, Playwright, Wit",
      lifespan: "1854 – 1900",
      bio: "Aesthetician, dramatist, and apostle of art for art's sake. Convicted of 'gross indecency' in 1895; his later writing was shaped by prison.",
    },
  ];

export const quotes = [
  // — Marcus Aurelius, Meditations —
  {
    id: "m1",
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book IV",
    topics: ["discipline", "resilience"],
  },
  {
    id: "m2",
    text: "The happiness of your life depends upon the quality of your thoughts.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book IV",
    topics: ["wisdom", "self-knowledge"],
  },
  {
    id: "m3",
    text: "Waste no more time arguing about what a good man should be. Be one.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book X",
    topics: ["virtue", "discipline"],
  },
  {
    id: "m4",
    text: "If it is not right, do not do it; if it is not true, do not say it.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book XII",
    topics: ["virtue", "discipline"],
  },
  {
    id: "m5",
    text: "The best revenge is not to be like your enemy.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book VI",
    topics: ["virtue", "anger"],
  },
  {
    id: "m6",
    text: "Confine yourself to the present.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book VII",
    topics: ["time", "discipline"],
  },
  {
    id: "m7",
    text: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book VII",
    topics: ["wisdom", "self-knowledge"],
  },
  {
    id: "m8",
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book IV",
    topics: ["wisdom", "self-knowledge"],
  },

  // — Seneca, Epistulae Morales & essays —
  {
    id: "s1",
    text: "We suffer more often in imagination than in reality.",
    authorId: "seneca",
    source: "Epistulae Morales, Letter XIII",
    topics: ["resilience", "self-knowledge"],
  },
  {
    id: "s2",
    text: "Luck is what happens when preparation meets opportunity.",
    authorId: "seneca",
    source: "Attributed; cf. Epistulae Morales",
    topics: ["virtue", "discipline"],
  },
  {
    id: "s3",
    text: "Difficulties strengthen the mind, as labor does the body.",
    authorId: "seneca",
    source: "De Providentia",
    topics: ["resilience", "discipline"],
  },
  {
    id: "s4",
    text: "He who fears death will never do anything worthy of a living man.",
    authorId: "seneca",
    source: "Epistulae Morales, Letter XXX",
    topics: ["death", "courage"],
  },
  {
    id: "s5",
    text: "As is a tale, so is life: not how long it is, but how good it is, is what matters.",
    authorId: "seneca",
    source: "De Brevitate Vitae",
    topics: ["time", "virtue"],
  },
  {
    id: "s6",
    text: "While we wait for life, life passes.",
    authorId: "seneca",
    source: "De Brevitate Vitae",
    topics: ["time", "discipline"],
  },
  {
    id: "s7",
    text: "If a man knows not to which port he sails, no wind is favorable.",
    authorId: "seneca",
    source: "Epistulae Morales, Letter LXXI",
    topics: ["wisdom", "discipline"],
  },
  {
    id: "s8",
    text: "Wherever there is a human being, there is an opportunity for a kindness.",
    authorId: "seneca",
    source: "De Ira",
    topics: ["virtue", "anger"],
  },

  // — Epictetus, Enchiridion & Discourses —
  {
    id: "e1",
    text: "It's not what happens to you, but how you react to it that matters.",
    authorId: "epictetus",
    source: "Enchiridion, §5",
    topics: ["resilience", "discipline"],
  },
  {
    id: "e2",
    text: "Wealth consists not in having great possessions, but in having few wants.",
    authorId: "epictetus",
    source: "Discourses, III.9",
    topics: ["virtue", "self-knowledge"],
  },
  {
    id: "e3",
    text: "Make the best use of what is in your power, and take the rest as it happens.",
    authorId: "epictetus",
    source: "Enchiridion, §1",
    topics: ["resilience", "fate"],
  },
  {
    id: "e4",
    text:
      "Don't demand that things happen as you wish, but wish that they happen as they do happen, and it will go well with you.",
    authorId: "epictetus",
    source: "Enchiridion, §8",
    topics: ["fate", "resilience"],
  },
  {
    id: "e5",
    text: "No man is free who is not master of himself.",
    authorId: "epictetus",
    source: "Enchiridion (fragments)",
    topics: ["discipline", "self-knowledge"],
  },

  // — Musonius Rufus —
  {
    id: "r1",
    text: "The reward of philosophy is the perfection of the soul.",
    authorId: "musonius-rufus",
    source: "Fragments (Stobaeus)",
    topics: ["virtue", "wisdom"],
  },

  // — Cleanthes —
  {
    id: "c1",
    text: "Lead me, O Master of the mighty heavens, wheresoever you will.",
    authorId: "cleanthes",
    source: "Hymn to Zeus",
    topics: ["fate", "courage"],
  },

  // — Zeno of Citium —
  {
    id: "z1",
    text: "We have two ears and one mouth, so we should listen more than we say.",
    authorId: "zeno",
    source: "Attributed; Diogenes Laertius, VII.1.23",
    topics: ["wisdom", "discipline"],
  },
  {
    id: "z2",
    text: "Well-being is realized by small steps, but is truly no small thing.",
    authorId: "zeno",
    source: "Attributed; Stobaeus",
    topics: ["virtue", "discipline"],
  },

  // — Socrates (recorded by Plato, Apology) —
  {
    id: "so1",
    text: "The unexamined life is not worth living.",
    authorId: "socrates",
    source: "Apology, 38a (Plato's record)",
    topics: ["self-knowledge", "wisdom"],
  },
  {
    id: "so2",
    text: "The only true wisdom is in knowing you know nothing.",
    authorId: "socrates",
    source: "Apology (Plato's record, paraphrase)",
    topics: ["wisdom", "self-knowledge"],
  },

  // — Plato (Republic, Phaedrus) —
  {
    id: "p1",
    text: "The beginning is the most important part of the work.",
    authorId: "plato",
    source: "Republic, Book II",
    topics: ["action", "wisdom"],
  },
  {
    id: "p2",
    text: "Wise men speak because they have something to say; fools because they would have to say something.",
    authorId: "plato",
    source: "Attributed",
    topics: ["wisdom", "truth"],
  },

  // — Aristotle —
  {
    id: "a1",
    text: "The roots of education are bitter, but the fruit is sweet.",
    authorId: "aristotle",
    source: "Attributed; Politics, VIII",
    topics: ["knowledge", "learning"],
  },
  {
    id: "a2",
    text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.",
    authorId: "aristotle",
    source: "Attributed; cf. Nicomachean Ethics",
    topics: ["knowledge", "mind", "wisdom"],
  },

  // — Confucius (Analects) —
  {
    id: "co1",
    text: "It does not matter how slowly you go as long as you do not stop.",
    authorId: "confucius",
    source: "Analects (attributed)",
    topics: ["discipline", "resilience"],
  },
  {
    id: "co2",
    text: "By three methods we may learn wisdom: first, by reflection, which is noblest; second, by imitation, which is easiest; and third by experience, which is the bitterest.",
    authorId: "confucius",
    source: "Analects (attributed)",
    topics: ["wisdom", "learning"],
  },
  {
    id: "co3",
    text: "The man who moves a mountain begins by carrying away small stones.",
    authorId: "confucius",
    source: "Analects (attributed)",
    topics: ["action", "discipline"],
  },

  // — Lao Tzu (Tao Te Ching) —
  {
    id: "l1",
    text: "The journey of a thousand miles begins with a single step.",
    authorId: "lao-tzu",
    source: "Tao Te Ching, ch. 64",
    topics: ["action", "wisdom"],
  },
  {
    id: "l2",
    text: "When I let go of what I am, I become what I might be.",
    authorId: "lao-tzu",
    source: "Tao Te Ching (attributed)",
    topics: ["self-knowledge", "change"],
  },

  // — Cicero —
  {
    id: "ci1",
    text: "While there's life, there's hope.",
    authorId: "cicero",
    source: "Epistulae ad Atticum, IX.4",
    topics: ["hope", "resilience"],
  },
  {
    id: "ci2",
    text: "If you have a garden and a library, you have everything you need.",
    authorId: "cicero",
    source: "Epistulae ad Familiares, IX.4",
    topics: ["wisdom", "nature"],
  },

  // — Montaigne (Essais) —
  {
    id: "mo1",
    text: "The greatest thing in the world is to know how to belong to oneself.",
    authorId: "montaigne",
    source: "Essais, I.39",
    topics: ["self-knowledge", "wisdom"],
  },
  {
    id: "mo2",
    text: "A man who fears suffering is already suffering from what he fears.",
    authorId: "montaigne",
    source: "Essais",
    topics: ["self-knowledge", "resilience"],
  },

  // — Francis Bacon —
  {
    id: "b1",
    text: "Knowledge is power.",
    authorId: "bacon",
    source: "Meditationes Sacrae (1597)",
    topics: ["knowledge", "wisdom"],
  },
  {
    id: "b2",
    text: "If a man will begin with certainties, he shall end in doubts; but if he will be content to begin with doubts, he shall end in certainties.",
    authorId: "bacon",
    source: "Advancement of Learning, I.v.1",
    topics: ["knowledge", "truth"],
  },

  // — Voltaire —
  {
    id: "v1",
    text: "Common sense is not so common.",
    authorId: "voltaire",
    source: "Dictionnaire Philosophique (1764)",
    topics: ["wisdom", "truth"],
  },
  {
    id: "v2",
    text: "Doubt is not a pleasant condition, but certainty is an absurd one.",
    authorId: "voltaire",
    source: "Letter to Frederick the Great, 1767",
    topics: ["truth", "knowledge"],
  },

  // — Benjamin Franklin (Poor Richard's Almanack) —
  {
    id: "f1",
    text: "Well done is better than well said.",
    authorId: "franklin",
    source: "Poor Richard's Almanack, 1739",
    topics: ["action", "virtue"],
  },
  {
    id: "f2",
    text: "Either write something worth reading or do something worth writing.",
    authorId: "franklin",
    source: "Poor Richard's Almanack (attributed)",
    topics: ["action", "knowledge"],
  },

  // — Immanuel Kant —
  {
    id: "k1",
    text: "Two things fill the mind with ever new and increasing admiration and awe: the starry heavens above me and the moral law within me.",
    authorId: "kant",
    source: "Critique of Practical Reason (1788)",
    topics: ["nature", "wisdom", "self-knowledge"],
  },

  // — Ralph Waldo Emerson —
  {
    id: "em1",
    text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    authorId: "emerson",
    source: "Essays: First Series (commonly attributed)",
    topics: ["self-knowledge", "courage"],
  },
  {
    id: "em2",
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    authorId: "emerson",
    source: "Attributed; cf. Essays",
    topics: ["courage", "action"],
  },

  // — Henry David Thoreau (Walden) —
  {
    id: "th1",
    text: "I went to the woods because I wished to live deliberately, to front only the essential facts of life.",
    authorId: "thoreau",
    source: "Walden (1854), ch. II",
    topics: ["self-knowledge", "nature"],
  },
  {
    id: "th2",
    text: "The mass of men lead lives of quiet desperation.",
    authorId: "thoreau",
    source: "Walden (1854), ch. I",
    topics: ["self-knowledge", "wisdom"],
  },

  // — Friedrich Nietzsche —
  {
    id: "n1",
    text: "He who has a why to live can bear almost any how.",
    authorId: "nietzsche",
    source: "Twilight of the Idols (1889)",
    topics: ["resilience", "purpose"],
  },
  {
    id: "n2",
    text: "That which does not kill us makes us stronger.",
    authorId: "nietzsche",
    source: "Twilight of the Idols (1888), §8",
    topics: ["resilience", "courage"],
  },
  {
    id: "n3",
    text: "And those who were seen dancing were thought to be insane by those who could not hear the music.",
    authorId: "nietzsche",
    source: "Attributed; Thus Spoke Zarathustra",
    topics: ["self-knowledge", "wisdom"],
  },

  // — Leo Tolstoy —
  {
    id: "to1",
    text: "If you want to be happy, be.",
    authorId: "tolstoy",
    source: "Proverbs (attributed)",
    topics: ["happiness", "wisdom"],
  },
  {
    id: "to2",
    text: "Everyone thinks of changing the world, but no one thinks of changing himself.",
    authorId: "tolstoy",
    source: "Three Arshins of Land (attributed)",
    topics: ["self-knowledge", "change"],
  },

  // — Mark Twain —
  {
    id: "tw1",
    text: "The two most important days in your life are the day you are born and the day you find out why.",
    authorId: "twain",
    source: "Attributed (orig. uncertain)",
    topics: ["self-knowledge", "purpose"],
  },
  {
    id: "tw2",
    text: "Whenever you find yourself on the side of the majority, it is time to pause and reflect.",
    authorId: "twain",
    source: "Notebook (1905, attributed)",
    topics: ["wisdom", "self-knowledge"],
  },
  {
    id: "tw3",
    text: "The secret of getting ahead is getting started.",
    authorId: "twain",
    source: "Attributed",
    topics: ["action", "discipline"],
  },

  // — Oscar Wilde —
  {
    id: "ow1",
    text: "Be yourself; everyone else is already taken.",
    authorId: "wilde",
    source: "Attributed (often to Wilde)",
    topics: ["self-knowledge", "wisdom"],
  },
  {
    id: "ow2",
    text: "To live is the rarest thing in the world. Most people exist, that is all.",
    authorId: "wilde",
    source: "The Soul of Man under Socialism (1891)",
    topics: ["self-knowledge", "purpose"],
  },
  {
    id: "ow3",
    text: "Always forgive your enemies; nothing annoys them so much.",
    authorId: "wilde",
    source: "Attributed",
    topics: ["virtue", "anger"],
  },
];
