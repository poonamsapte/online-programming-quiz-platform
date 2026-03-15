const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Models
const User = require('./models/User');
const Question = require('./models/Question');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz-platform';

const questions = [
    // ====================== JAVA =======================
    {
        language: 'Java',
        questionText: 'Which of the following is the correct way to declare a variable in Java?',
        options: ['int x = 5;', 'x int = 5;', 'declare int x = 5;', 'var x = 5 of int;'],
        correctAnswer: 'int x = 5;',
        difficulty: 'Easy',
    },
    {
        language: 'Java',
        questionText: 'What is the default value of a boolean variable in Java?',
        options: ['true', 'false', '0', 'null'],
        correctAnswer: 'false',
        difficulty: 'Easy',
    },
    {
        language: 'Java',
        questionText: 'Which keyword is used to inherit a class in Java?',
        options: ['extends', 'implements', 'inherits', 'super'],
        correctAnswer: 'extends',
        difficulty: 'Easy',
    },
    {
        language: 'Java',
        questionText: 'What does JVM stand for?',
        options: ['Java Virtual Machine', 'Java Variable Method', 'Java Visual Monitor', 'Java Verified Module'],
        correctAnswer: 'Java Virtual Machine',
        difficulty: 'Easy',
    },
    {
        language: 'Java',
        questionText: 'Which method is the entry point of a Java program?',
        options: ['public static void main(String[] args)', 'public void start()', 'static void run()', 'void main()'],
        correctAnswer: 'public static void main(String[] args)',
        difficulty: 'Easy',
    },
    {
        language: 'Java',
        questionText: 'Which of the following is NOT a Java primitive type?',
        options: ['String', 'int', 'boolean', 'char'],
        correctAnswer: 'String',
        difficulty: 'Medium',
    },
    {
        language: 'Java',
        questionText: 'What does the "final" keyword mean when applied to a variable?',
        options: ['The variable cannot be reassigned', 'The variable is static', 'The variable is public', 'The variable is deleted after use'],
        correctAnswer: 'The variable cannot be reassigned',
        difficulty: 'Medium',
    },
    {
        language: 'Java',
        questionText: 'Which collection allows duplicate elements in Java?',
        options: ['ArrayList', 'HashSet', 'TreeSet', 'LinkedHashSet'],
        correctAnswer: 'ArrayList',
        difficulty: 'Medium',
    },
    {
        language: 'Java',
        questionText: 'What is the output of: System.out.println(10 / 3)?',
        options: ['3', '3.33', '3.0', '4'],
        correctAnswer: '3',
        difficulty: 'Medium',
    },
    {
        language: 'Java',
        questionText: 'Which interface must be implemented to make a class iterable?',
        options: ['Iterable', 'Iterator', 'Collection', 'Enumerable'],
        correctAnswer: 'Iterable',
        difficulty: 'Hard',
    },

    // ====================== C++ =======================
    {
        language: 'C++',
        questionText: 'Which operator is used for dynamic memory allocation in C++?',
        options: ['new', 'malloc', 'alloc', 'create'],
        correctAnswer: 'new',
        difficulty: 'Easy',
    },
    {
        language: 'C++',
        questionText: 'What is the correct syntax for a single-line comment in C++?',
        options: ['// comment', '# comment', '/* comment */', '<!-- comment -->'],
        correctAnswer: '// comment',
        difficulty: 'Easy',
    },
    {
        language: 'C++',
        questionText: 'What does "cin" stand for in C++?',
        options: ['Character Input', 'Console Input', 'Control Input', 'Class Input'],
        correctAnswer: 'Character Input',
        difficulty: 'Easy',
    },
    {
        language: 'C++',
        questionText: 'Which of the following is the correct header file for using cout in C++?',
        options: ['<iostream>', '<stdio.h>', '<conio.h>', '<fstream>'],
        correctAnswer: '<iostream>',
        difficulty: 'Easy',
    },
    {
        language: 'C++',
        questionText: 'What is a destructor in C++?',
        options: ['A function that is called when an object is destroyed', 'A function to delete a class', 'A special assignment operator', 'A type of pointer'],
        correctAnswer: 'A function that is called when an object is destroyed',
        difficulty: 'Medium',
    },
    {
        language: 'C++',
        questionText: 'What is the difference between "struct" and "class" in C++?',
        options: ['Members are public by default in struct, private in class', 'Struct cannot have functions', 'Class cannot inherit', 'There is no difference'],
        correctAnswer: 'Members are public by default in struct, private in class',
        difficulty: 'Medium',
    },
    {
        language: 'C++',
        questionText: 'Which of the following is NOT a C++ access modifier?',
        options: ['friend', 'public', 'private', 'protected'],
        correctAnswer: 'friend',
        difficulty: 'Medium',
    },
    {
        language: 'C++',
        questionText: 'What is operator overloading in C++?',
        options: ['Giving new meaning to existing operators for user-defined types', 'Creating new operators', 'Removing existing operators', 'Loading operators from a library'],
        correctAnswer: 'Giving new meaning to existing operators for user-defined types',
        difficulty: 'Medium',
    },
    {
        language: 'C++',
        questionText: 'What does the "virtual" keyword do in C++?',
        options: ['Enables polymorphism by allowing function overriding in derived classes', 'Creates a virtual copy of the object', 'Allocates memory virtually', 'Restricts function calls'],
        correctAnswer: 'Enables polymorphism by allowing function overriding in derived classes',
        difficulty: 'Hard',
    },
    {
        language: 'C++',
        questionText: 'What is a "template" in C++?',
        options: ['A feature for writing generic code that works with any data type', 'A predefined class', 'A header file', 'A type of pointer'],
        correctAnswer: 'A feature for writing generic code that works with any data type',
        difficulty: 'Hard',
    },

    // ====================== PYTHON =======================
    {
        language: 'Python',
        questionText: 'How do you create a comment in Python?',
        options: ['# This is a comment', '// This is a comment', '/* This is a comment */', '<!-- This is a comment -->'],
        correctAnswer: '# This is a comment',
        difficulty: 'Easy',
    },
    {
        language: 'Python',
        questionText: 'Which of the following is used to define a function in Python?',
        options: ['def', 'function', 'func', 'define'],
        correctAnswer: 'def',
        difficulty: 'Easy',
    },
    {
        language: 'Python',
        questionText: 'What is the output of: print(type(3.14))?',
        options: ["<class 'float'>", "<class 'int'>", "<class 'double'>", "<class 'number'>"],
        correctAnswer: "<class 'float'>",
        difficulty: 'Easy',
    },
    {
        language: 'Python',
        questionText: 'Which of the following data types is mutable in Python?',
        options: ['list', 'tuple', 'string', 'frozenset'],
        correctAnswer: 'list',
        difficulty: 'Easy',
    },
    {
        language: 'Python',
        questionText: 'What does the "len()" function do in Python?',
        options: ['Returns the length of an object', 'Returns the last element', 'Returns the type of an object', 'None of the above'],
        correctAnswer: 'Returns the length of an object',
        difficulty: 'Easy',
    },
    {
        language: 'Python',
        questionText: 'What is a lambda function in Python?',
        options: ['An anonymous, single-expression function', 'A function imported from lambda module', 'A function with multiple return values', 'A class method'],
        correctAnswer: 'An anonymous, single-expression function',
        difficulty: 'Medium',
    },
    {
        language: 'Python',
        questionText: 'What is the output of: print(2 ** 3)?',
        options: ['8', '6', '9', '23'],
        correctAnswer: '8',
        difficulty: 'Medium',
    },
    {
        language: 'Python',
        questionText: 'Which method is used to add an element to a list in Python?',
        options: ['append()', 'add()', 'insert_end()', 'push()'],
        correctAnswer: 'append()',
        difficulty: 'Medium',
    },
    {
        language: 'Python',
        questionText: 'Which module is used for regular expressions in Python?',
        options: ['re', 'regex', 'regexp', 'rx'],
        correctAnswer: 're',
        difficulty: 'Medium',
    },
    {
        language: 'Python',
        questionText: 'What is list comprehension in Python?',
        options: ['A concise way to create lists from iterables', 'A way to import lists', 'A method to sort a list', 'A method to compress a list'],
        correctAnswer: 'A concise way to create lists from iterables',
        difficulty: 'Hard',
    },

    // ====================== HTML =======================
    {
        language: 'HTML',
        questionText: 'What does HTML stand for?',
        options: ['HyperText Markup Language', 'HyperText Mode Language', 'HighText Markup Language', 'HyperTransfer Markup Language'],
        correctAnswer: 'HyperText Markup Language',
        difficulty: 'Easy',
    },
    {
        language: 'HTML',
        questionText: 'Which HTML element is used to define the title of document shown in the browser tab?',
        options: ['<title>', '<head>', '<header>', '<meta>'],
        correctAnswer: '<title>',
        difficulty: 'Easy',
    },
    {
        language: 'HTML',
        questionText: 'Which attribute specifies the URL of the page the link goes to?',
        options: ['href', 'src', 'link', 'url'],
        correctAnswer: 'href',
        difficulty: 'Easy',
    },
    {
        language: 'HTML',
        questionText: 'Which HTML tag is used to create an unordered list?',
        options: ['<ul>', '<ol>', '<li>', '<list>'],
        correctAnswer: '<ul>',
        difficulty: 'Easy',
    },
    {
        language: 'HTML',
        questionText: 'What is the correct HTML element for inserting a line break?',
        options: ['<br>', '<lb>', '<break>', '<newline>'],
        correctAnswer: '<br>',
        difficulty: 'Easy',
    },
    {
        language: 'HTML',
        questionText: 'Which attribute is used to define inline styles in HTML?',
        options: ['style', 'class', 'font', 'css'],
        correctAnswer: 'style',
        difficulty: 'Medium',
    },
    {
        language: 'HTML',
        questionText: 'Which HTML5 element is used to play video files?',
        options: ['<video>', '<media>', '<movie>', '<src>'],
        correctAnswer: '<video>',
        difficulty: 'Medium',
    },
    {
        language: 'HTML',
        questionText: 'What is the purpose of the "alt" attribute in the <img> tag?',
        options: ['Provides alternative text if the image cannot be displayed', 'Sets the alignment of the image', 'Changes the image source', 'Adds a link to the image'],
        correctAnswer: 'Provides alternative text if the image cannot be displayed',
        difficulty: 'Medium',
    },
    {
        language: 'HTML',
        questionText: 'Which HTML element is used for the largest heading?',
        options: ['<h1>', '<heading>', '<h6>', '<head>'],
        correctAnswer: '<h1>',
        difficulty: 'Easy',
    },
    {
        language: 'HTML',
        questionText: 'What does the "<!DOCTYPE html>" declaration do?',
        options: ['Defines the document type and version of HTML', 'Creates a comment', 'Starts the HTML document body', 'Imports a stylesheet'],
        correctAnswer: 'Defines the document type and version of HTML',
        difficulty: 'Medium',
    },
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Ensure an admin user exists or create one
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            adminUser = await User.create({
                name: 'Admin',
                email: 'admin@quizmaster.com',
                password: 'admin123456',
                role: 'admin',
            });
            console.log('✅ Admin user created: admin@quizmaster.com / admin123456');
        } else {
            console.log(`✅ Using existing admin: ${adminUser.email}`);
        }

        // Clear only existing seeded questions (optional: clear all)
        const deletedCount = await Question.deleteMany({});
        console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing questions`);

        // Attach admin id to all questions
        const questionsWithAdmin = questions.map(q => ({
            ...q,
            createdBy: adminUser._id,
        }));

        // Insert all questions
        const inserted = await Question.insertMany(questionsWithAdmin);
        console.log(`✅ Seeded ${inserted.length} questions successfully!`);

        // Summary
        const summary = await Question.aggregate([{ $group: { _id: '$language', count: { $sum: 1 } } }]);
        console.log('\n📊 Questions per language:');
        summary.forEach(s => console.log(`   ${s._id}: ${s.count} questions`));

        mongoose.connection.close();
        console.log('\n🎉 Seeding complete! You can now log in and take quizzes.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
};

seedDB();
