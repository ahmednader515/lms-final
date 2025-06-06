"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, BookOpen, Award, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { ScrollProgress } from "@/components/scroll-progress";
import { useEffect, useState } from "react";
import { Course, Purchase } from "@prisma/client";
import { db } from "@/lib/db"; // Import db client

type CourseWithProgress = Course & {
  chapters: { id: string }[]; // Ensure chapters is an array of objects with id
  purchases: Purchase[];
  progress: number;
};

export default function HomePage() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch courses from API endpoint that includes purchases and calculates progress
        const response = await fetch("/api/courses?includeProgress=true"); // Assuming an API endpoint or will create one if needed
        const data = await response.json();

        // Calculate progress if not already done by API
        const coursesWithCalculatedProgress = await Promise.all(
          data.map(async (course: Course & { chapters?: { id: string }[]; purchases?: Purchase[] }) => {
            const totalChapters = course.chapters?.length || 0;
            let completedChapters = 0;

            if (course.purchases && course.purchases.length > 0 && course.chapters) {
               // Fetch user progress only if the user has purchased the course
              const userProgress = await db.userProgress.count({
                where: {
                  userId: "YOUR_USER_ID", // **NEED TO GET ACTUAL USER ID HERE**
                  chapterId: {
                    in: course.chapters.map(chapter => chapter.id)
                  },
                  isCompleted: true
                }
              });
              completedChapters = userProgress;
            }

            const progress = totalChapters > 0 
              ? (completedChapters / totalChapters) * 100 
              : 0;

            return {
              ...course,
              progress,
              chapters: course.chapters || [], // Ensure chapters is always an array
              purchases: course.purchases || [] // Ensure purchases is always an array
            } as CourseWithProgress;
          })
        );

        setCourses(coursesWithCalculatedProgress);

      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowScrollIndicator(entry.isIntersecting);
      },
      {
        threshold: 0.5, // Trigger when 50% of the hero section is visible
      }
    );

    const heroSection = document.getElementById('hero-section');
    if (heroSection) {
      observer.observe(heroSection);
    }

    return () => {
      if (heroSection) {
        observer.unobserve(heroSection);
      }
    };
  }, []);

  const scrollToCourses = () => {
    const coursesSection = document.getElementById('courses-section');
    if (coursesSection) {
      const offset = coursesSection.offsetTop - 80; // Adjust for navbar height
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="h-full w-full bg-background">
      <Navbar />
      <ScrollProgress />
      {/* Hero Section */}
      <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Text Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              نادر غزال
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              &ldquo;نادر غزال&rdquo; هو منصة تعليمية متكاملة تهدف إلى تبسيط المواد الدراسية
            </p>
            <Button size="lg" asChild className="bg-[#BC8B26] hover:bg-[#BC8B26]/90 text-white">
              <Link href="/sign-up">
                ابدأ الآن <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] w-full"
          >
            <Image
              src="/teacher-image.png"
              alt="نادر غزال"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            {/* Floating Stationery Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: [0, -15, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 0.5, 
                delay: 0.5,
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                rotate: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="absolute top-1/4 -right-8"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Image
                src="/pencil.png"
                alt="قلم"
                width={60}
                height={60}
                className="object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: [0, -12, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 0.5, 
                delay: 0.7,
                y: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                rotate: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="absolute bottom-1/4 -left-4"
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <Image
                src="/eraser.png"
                alt="ممحاة"
                width={50}
                height={50}
                className="object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: [0, -18, 0],
                rotate: [0, 10, 0]
              }}
              transition={{ 
                duration: 0.5, 
                delay: 0.9,
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                rotate: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="absolute top-1/2 -right-12"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Image
                src="/ruler.png"
                alt="مسطرة"
                width={70}
                height={70}
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={scrollToCourses}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            >
              <ChevronDown className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            >
              <ChevronDown className="h-8 w-8 text-muted-foreground" />
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Courses Section */}
      <section id="courses-section" className="py-20 bg-muted/50">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">الدورات المتاحة</h2>
            <p className="text-muted-foreground">اكتشف مجموعة متنوعة من الدورات التعليمية المميزة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl overflow-hidden border shadow-sm animate-pulse"
                >
                  <div className="w-full aspect-video bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative w-full aspect-video">
                    <Image
                      src={course.imageUrl || "/placeholder.png"}
                      alt={course.title}
                      fill
                      className="object-cover rounded-t-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.chapters?.length || 0} {course.chapters?.length === 1 ? "فصل" : "فصول"}</span>
                    </div>
                    <Button 
                      className="w-full bg-[#BC8B26] hover:bg-[#BC8B26]/90 text-white" 
                      variant="default"
                      asChild
                    >
                      <Link href={course.chapters && course.chapters.length > 0 ? `/courses/${course.id}/chapters/${course.chapters[0].id}` : `/courses/${course.id}`}>
                        {course.progress === 100 ? "عرض الدورة" : "عرض الدورة"}
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">آراء الطلاب</h2>
            <p className="text-muted-foreground">ماذا يقول طلابنا عن تجربتهم معنا</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "عصام اسامة",
                grade: "الصف الأول الثانوي",
                testimonial: "تجربة رائعة مع الأستاذ نادر، شرح مميز وطريقة سهلة في توصيل المعلومة"
              },
              {
                name: "سيف طارق",
                grade: "الصف الثاني الثانوي",
                testimonial: "المنهج منظم جداً والشرح واضح، ساعدني في فهم المواد بشكل أفضل"
              },
              {
                name: "عمر جمال",
                grade: "الصف الأول الثانوي",
                testimonial: "أفضل منصة تعليمية استخدمتها، المحتوى غني والشرح مبسط"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src="/male.png"
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mr-4">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.grade}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  &ldquo;{testimonial.testimonial}&rdquo;
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">مميزات المنصة</h2>
            <p className="text-muted-foreground">اكتشف ما يجعل منصتنا مميزة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-[#BC8B26]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-[#BC8B26]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">جودة عالية</h3>
              <p className="text-muted-foreground">دورات تعليمية عالية الجودة مع أفضل المدرسين</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-[#BC8B26]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-[#BC8B26]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">مجتمع نشط</h3>
              <p className="text-muted-foreground">انضم إلى مجتمع من الطلاب النشطين والمتحمسين</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-[#BC8B26]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-[#BC8B26]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">شهادات معتمدة</h3>
              <p className="text-muted-foreground">احصل على شهادات معتمدة عند إكمال الدورات</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ابدأ رحلة التعلم معنا</h2>
            <p className="text-muted-foreground mb-8">
              انضم إلينا اليوم وابدأ رحلة النجاح
            </p>
            <Button size="lg" asChild>
              <Link href="/sign-up">
                سجل الآن <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 