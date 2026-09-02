import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting seed...");
const user = await prisma.user.upsert({
  where: {
    email: "student@example.com",
  },
  update: {
    name: "นักเรียนทดลอง",
    role: "STUDENT",
  },
  create: {
    name: "นักเรียนทดลอง",
    email: "student@example.com",
    role: "STUDENT",
  },
});

console.log(`✅ Demo user created: ${user.email}`);
  const subjects = [
    {
      name: "ภาษาไทย",
      description: "ฝึกทำข้อสอบวิชาภาษาไทย",
    },
    {
      name: "ภาษาอังกฤษ",
      description: "ฝึกทำข้อสอบวิชาภาษาอังกฤษ",
    },
    {
      name: "คณิตศาสตร์",
      description: "ฝึกทำข้อสอบวิชาคณิตศาสตร์",
    },
    {
      name: "วิทยาศาสตร์",
      description: "ฝึกทำข้อสอบวิชาวิทยาศาสตร์",
    },
    {
      name: "กฎหมาย",
      description: "ฝึกทำข้อสอบวิชากฎหมาย",
    },
    {
      name: "คอมพิวเตอร์",
      description: "ฝึกทำข้อสอบวิชาคอมพิวเตอร์",
    },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: {
        name: subject.name,
      },
      update: {
        description: subject.description,
      },
      create: subject,
    });
  }

  console.log("✅ Subjects created");

  const allSubjects = await prisma.subject.findMany();

  const exam = await prisma.exam.upsert({
    where: {
      id: 1,
    },
    update: {
      title: "แบบทดสอบนายสิบตำรวจ - ชุดทดลอง",
      description: "แบบทดสอบสำหรับทดลองระบบ",
      duration: 60,
    },
    create: {
      id: 1,
      title: "แบบทดสอบนายสิบตำรวจ - ชุดทดลอง",
      description: "แบบทดสอบสำหรับทดลองระบบ",
      duration: 60,
    },
  });

  console.log(`✅ Exam created: ${exam.title}`);

  const sampleQuestions = [
    {
      subject: "ภาษาไทย",
      question: "ข้อใดเขียนถูกต้อง",
      choices: [
        { text: "อนุญาติ", isCorrect: false },
        { text: "อนุญาต", isCorrect: true },
        { text: "อนุญาติ์", isCorrect: false },
        { text: "อนุญาติการ", isCorrect: false },
      ],
      explanation: "คำที่ถูกต้องคือ “อนุญาต”",
    },
    {
      subject: "ภาษาอังกฤษ",
      question: "What is the opposite of 'hot'?",
      choices: [
        { text: "Cold", isCorrect: true },
        { text: "Warm", isCorrect: false },
        { text: "Big", isCorrect: false },
        { text: "Fast", isCorrect: false },
      ],
      explanation: "The opposite of hot is cold.",
    },
    {
      subject: "คณิตศาสตร์",
      question: "ถ้า 10 + 15 = ?",
      choices: [
        { text: "20", isCorrect: false },
        { text: "25", isCorrect: true },
        { text: "30", isCorrect: false },
        { text: "35", isCorrect: false },
      ],
      explanation: "10 + 15 = 25",
    },
    {
      subject: "วิทยาศาสตร์",
      question: "ดาวเคราะห์ดวงใดอยู่ใกล้ดวงอาทิตย์มากที่สุด",
      choices: [
        { text: "โลก", isCorrect: false },
        { text: "ดาวอังคาร", isCorrect: false },
        { text: "ดาวพุธ", isCorrect: true },
        { text: "ดาวศุกร์", isCorrect: false },
      ],
      explanation: "ดาวพุธเป็นดาวเคราะห์ที่อยู่ใกล้ดวงอาทิตย์ที่สุด",
    },
    {
      subject: "กฎหมาย",
      question: "กฎหมายสูงสุดของประเทศไทยคืออะไร",
      choices: [
        { text: "พระราชบัญญัติ", isCorrect: false },
        { text: "รัฐธรรมนูญ", isCorrect: true },
        { text: "กฎกระทรวง", isCorrect: false },
        { text: "ประกาศ", isCorrect: false },
      ],
      explanation: "รัฐธรรมนูญเป็นกฎหมายสูงสุดของประเทศ",
    },
    {
      subject: "คอมพิวเตอร์",
      question: "HTML ใช้สำหรับทำอะไร",
      choices: [
        { text: "จัดโครงสร้างหน้าเว็บ", isCorrect: true },
        { text: "จัดการฐานข้อมูล", isCorrect: false },
        { text: "สร้างระบบปฏิบัติการ", isCorrect: false },
        { text: "ป้องกันไวรัส", isCorrect: false },
      ],
      explanation: "HTML ใช้สำหรับกำหนดโครงสร้างและเนื้อหาของหน้าเว็บ",
    },
  ];

  for (const item of sampleQuestions) {
    const subject = allSubjects.find(
      (s) => s.name === item.subject
    );

    if (!subject) {
      throw new Error(`Subject not found: ${item.subject}`);
    }

    const question = await prisma.question.create({
      data: {
        question: item.question,
        explanation: item.explanation,
        subjectId: subject.id,
        choices: {
          create: item.choices,
        },
      },
      include: {
        choices: true,
      },
    });

    await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        questionId: question.id,
        order: question.id,
      },
    });
  }

  console.log("✅ Sample questions created");
  console.log("🎉 Seed completed!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
