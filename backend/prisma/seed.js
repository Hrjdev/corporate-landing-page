const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default data...');

  // 1. Create Default Site Settings
  await prisma.siteContent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      heroTitle: 'Kurumsal Vizyonunuzu Dijitale Taşıyın',
      heroSubtitle: 'Modern teknolojiler ve yenilikçi çözümlerle işletmenizin dijital dönüşüm yolculuğunda güvenilir teknoloji ortağınız.',
      contactEmail: 'hello@nexustech.corp',
      contactPhone: '+90 (212) 555 01 23',
      contactAddress: 'Teknoloji Vadisi, İnovasyon Cd. No:42 Kadıköy, İstanbul'
    }
  });
  console.log('SiteContent restored.');

  // 2. Create Default Admin User
  const initialUser = process.env.INITIAL_ADMIN_USER || 'admin';
  let initialPass = process.env.INITIAL_ADMIN_PASSWORD;
  
  let isGeneratedPassword = false;
  if (!initialPass) {
    const crypto = require('crypto');
    // Güvenlik açığı oluşmaması için rastgele, tahmin edilemez bir şifre üretilir.
    initialPass = crypto.randomBytes(6).toString('hex');
    isGeneratedPassword = true;
  }

  const adminExists = await prisma.admin.findUnique({ where: { username: initialUser } });
  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(initialPass, 10);
    await prisma.admin.create({
      data: {
        name: 'Sistem Yöneticisi',
        username: initialUser,
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    });
    console.log(`Admin user created (Username: ${initialUser}).`);
    
    if (isGeneratedPassword) {
      console.log('\n=========================================================');
      console.log('                   GÜVENLİK BİLGİSİ                      ');
      console.log('=========================================================');
      console.log('İlk yönetici hesabı güvenli rastgele bir şifre ile');
      console.log('oluşturulmuştur. Hardcoded "123456" şifresi güvenlik');
      console.log('riskleri nedeniyle kaldırılmıştır.');
      console.log(`\nKullanıcı Adı : ${initialUser}`);
      console.log(`Geçici Şifre  : ${initialPass}`);
      console.log('\nLütfen sisteme giriş yaptıktan sonra şifrenizi değiştirin.');
      console.log('=========================================================\n');
    }
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
