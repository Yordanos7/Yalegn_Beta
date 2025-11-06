import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth } from "@my-better-t-app/auth";
import { fromNodeHeaders } from "better-auth/node";
import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto"; // Import crypto for unique slug generation
import {
  AccountType,
  CategoryEnum,
  ExperienceLevel,
  FreelancerLevel,
  DeliveryTime,
  JobType,
  Role, // Added Role for whereClause
  VerificationStatus, // Added VerificationStatus
} from "@my-better-t-app/db/prisma/generated/enums"; // Corrected import path for enums

export const userRouter = router({
  getUserProfile: protectedProcedure.query(
    async ({ ctx: { user, prisma } }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          location: true,
          accountType: true,
          isOpenToWork: true,
          languages: true,
          createdAt: true,
          updatedAt: true,
          coins: true,
          profile: {
            // Added profile select
            select: {
              headline: true,
              hourlyRate: true,
              currency: true,
              availability: true,
              completedJobs: true,
              successRate: true,
              portfolio: true,
              education: true,
              experience: true,
              averageRating: true,
              mainCategory: true,
              rateTypePreference: true,
              experienceLevel: true,
              freelancerLevel: true,
              deliveryTime: true,
              goals: true,
              isPublicFreelancer: true,
              skills: {
                select: {
                  level: true,
                  skill: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          verification: {
            select: {
              status: true,
              idFrontImage: true, // Added
              idBackImage: true, // Added
            },
          },
        },
      });

      if (!userData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return userData;
    }
  ),

  uploadProfileImage: protectedProcedure
    .input(z.object({ imageData: z.string() })) // Accept base64 image data
    .mutation(async ({ ctx: { user, prisma, req, res }, input }) => {
      try {
        console.log(
          "tRPC uploadProfileImage mutation received image data (length):",
          input.imageData.length
        );

        const updatedUser = await prisma.user.update({
          where: { id: user!.id },
          data: { image: input.imageData }, // Store base64 data directly
        });

        console.log(
          "Profile image successfully saved to DB (first 50 chars):",
          updatedUser.image?.substring(0, 50)
        );

        await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        return {
          message: "Profile image uploaded successfully",
          profileImage: updatedUser.image,
        };
      } catch (dbError) {
        console.error("Database update error in uploadProfileImage:", dbError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile image in database",
        });
      }
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        bio: z.string().optional(),
        location: z.string().optional(),
        languages: z.array(z.string()).optional(),
        mainCategory: z.nativeEnum(CategoryEnum).optional().nullable(),
        headline: z.string().optional(),
        hourlyRate: z.number().optional().nullable(),
        currency: z.enum(["ETB", "USD"]).optional().nullable(),
        rateTypePreference: z.nativeEnum(JobType).optional().nullable(),
        experienceLevel: z.nativeEnum(ExperienceLevel).optional().nullable(),
        freelancerLevel: z.nativeEnum(FreelancerLevel).optional().nullable(),
        deliveryTime: z.nativeEnum(DeliveryTime).optional().nullable(),
        availability: z.string().optional(),
        education: z.any().optional(),
        experience: z.any().optional(),
        image: z.string().optional().nullable(), // Added image field
      })
    )
    .mutation(async ({ ctx: { user, prisma, req, res }, input }) => {
      try {
        const userUpdateData: {
          name?: string;
          bio?: string;
          location?: string;
          languages?: string[];
          image?: string | null; // Added image to userUpdateData
        } = {};
        if (input.name !== undefined) userUpdateData.name = input.name;
        if (input.bio !== undefined) userUpdateData.bio = input.bio;
        if (input.location !== undefined)
          userUpdateData.location = input.location;
        if (input.languages !== undefined)
          userUpdateData.languages = input.languages;
        if (input.image !== undefined) userUpdateData.image = input.image; // Handle image update

        const updatedUser = await prisma.user.update({
          where: { id: user!.id },
          data: userUpdateData,
        });

        const profileUpdateData: {
          headline?: string;
          hourlyRate?: number | null;
          currency?: "ETB" | "USD" | null;
          availability?: string;
          education?: any;
          experience?: any;
          rateTypePreference?: JobType | null;
          experienceLevel?: ExperienceLevel | null;
          freelancerLevel?: FreelancerLevel | null;
          deliveryTime?: DeliveryTime | null;
          mainCategory?: CategoryEnum | null;
        } = {};
        if (input.headline !== undefined)
          profileUpdateData.headline = input.headline;
        if (input.hourlyRate !== undefined)
          profileUpdateData.hourlyRate = input.hourlyRate;
        if (input.currency !== undefined)
          profileUpdateData.currency = input.currency;
        if (input.availability !== undefined)
          profileUpdateData.availability = input.availability;
        if (input.education !== undefined)
          profileUpdateData.education = input.education;
        if (input.experience !== undefined)
          profileUpdateData.experience = input.experience;
        if (input.rateTypePreference !== undefined)
          profileUpdateData.rateTypePreference = input.rateTypePreference;
        if (input.experienceLevel !== undefined)
          profileUpdateData.experienceLevel = input.experienceLevel;
        if (input.freelancerLevel !== undefined)
          profileUpdateData.freelancerLevel = input.freelancerLevel;
        if (input.deliveryTime !== undefined)
          profileUpdateData.deliveryTime = input.deliveryTime;
        if (input.mainCategory !== undefined)
          profileUpdateData.mainCategory = input.mainCategory;

        await prisma.profile.upsert({
          where: { userId: user!.id },
          update: profileUpdateData,
          create: {
            userId: user!.id,
            ...profileUpdateData,
          },
        });

        await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        return {
          message: "Profile updated successfully",
          user: updatedUser,
        };
      } catch (error) {
        console.error("Database update error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user profile",
        });
      }
    }),

  updateSkills: protectedProcedure
    .input(z.object({ skills: z.array(z.string()) }))
    .mutation(async ({ ctx: { user, prisma, req, res }, input }) => {
      try {
        const skillConnects = await Promise.all(
          input.skills.map(async (skillName) => {
            const baseSkillSlug = skillName.toLowerCase().replace(/\s/g, "-");
            let skill = await prisma.skill.findUnique({
              where: { name: skillName }, // Prioritize finding by name
            });

            if (!skill) {
              // If not found by name, try to find by the generated base slug
              skill = await prisma.skill.findUnique({
                where: { slug: baseSkillSlug },
              });
            }

            if (!skill) {
              // If still not found, create a new skill with a guaranteed unique slug
              const uniqueSuffix = crypto.randomBytes(4).toString("hex");
              const uniqueSlug = `${baseSkillSlug}-${uniqueSuffix}`;
              skill = await prisma.skill.create({
                data: {
                  name: skillName,
                  slug: uniqueSlug,
                },
              });
            } else {
              // If skill exists, ensure its name is up-to-date
              if (skill.name !== skillName) {
                skill = await prisma.skill.update({
                  where: { id: skill.id },
                  data: { name: skillName },
                });
              }
              // If the existing skill's slug is different from baseSkillSlug,
              // it means it was likely created with a unique suffix. We should keep that slug.
              // No explicit update needed for slug here, as it's unique.
            }
            return { skillId: skill.id };
          })
        );

        await prisma.profile.update({
          where: { userId: user!.id },
          data: {
            skills: {
              deleteMany: {},
              create: skillConnects.map((s) => ({
                skill: { connect: { id: s.skillId } },
              })),
            },
          },
        });

        await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        return {
          message: "Skills updated successfully",
        };
      } catch (error) {
        console.error("Database update error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user skills",
        });
      }
    }),

  getSession: protectedProcedure.query(
    async ({ ctx: { user, prisma, session } }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          location: true,
          accountType: true,
        },
      });

      if (!fullUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        session: session,
        user: {
          ...user,
          ...fullUser,
        },
      };
    }
  ),

  getPublicUserProfile: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx: { prisma }, input }) => {
      const { userId } = input;
      const userProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          location: true,
          accountType: true,
          createdAt: true,
          languages: true,
          profile: {
            select: {
              headline: true,
              hourlyRate: true,
              currency: true,
              availability: true,
              completedJobs: true,
              successRate: true,
              experience: true,
              education: true,
              averageRating: true,
              mainCategory: true,
              rateTypePreference: true, // Added
              experienceLevel: true, // Added
              freelancerLevel: true, // Added
              deliveryTime: true, // Added
              goals: true, // Added
              isPublicFreelancer: true,
              skills: {
                select: {
                  level: true,
                  skill: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              portfolio: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  media: true,
                  link: true,
                },
              },
            },
          },
          verification: {
            select: {
              status: true,
              idFrontImage: true, // Added
              idBackImage: true, // Added
            },
          },
          updatedAt: true,
          coins: true,
        },
      });

      if (!userProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found.",
        });
      }

      return userProfile;
    }),

  list: protectedProcedure.query(async ({ ctx: { user, prisma } }) => {
    const userId = user?.id;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    return prisma.user.findMany({
      where: {
        id: {
          not: userId,
        },
        // Removed isOpenToWork: true to allow all users (except the current one) to be listed as potential conversation partners.
      },
      select: {
        id: true,
        name: true,
        email: true, // Added email
        image: true,
        bio: true,
        location: true,
        isVerified: true, // Added isVerified
        isOpenToWork: true,
        languages: true, // Added languages
        createdAt: true, // Added createdAt
        profile: {
          select: {
            headline: true,
            hourlyRate: true,
            currency: true,
            completedJobs: true,
            successRate: true,
            averageRating: true, // Added averageRating
            mainCategory: true, // Added mainCategory
            rateTypePreference: true, // Added
            experienceLevel: true, // Added
            freelancerLevel: true, // Added
            deliveryTime: true, // Added
            goals: true, // Added
            isPublicFreelancer: true, // Added
            skills: {
              select: {
                level: true, // Added level
                skill: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        verification: {
          select: {
            status: true,
            idFrontImage: true, // Added
            idBackImage: true, // Added
          },
        },
      },
    });
  }),

  completeOnboarding: protectedProcedure
    .input(
      z.object({
        step1: z.object({
          userType: z.enum(["individual", "organization"]),
          individualFocus: z
            .enum(["freelancer", "student", "mentor", "job_seeker", "other"])
            .optional(),
          organizationPurpose: z.string().optional(),
        }),
        step2: z.object({
          howHear: z.enum([
            "social_media",
            "friend",
            "organization",
            "search_engine",
            "other",
          ]),
          otherText: z.string().optional(),
        }),
        step3: z.object({
          goals: z.array(
            z.enum([
              "find_freelance_work",
              "hire_professionals",
              "apply_scholarships",
              "offer_scholarships_mentorship",
              "network_collaborate",
            ])
          ),
        }),
        step4: z.object({
          skills: z.array(z.string()),
        }),
      })
    )
    .mutation(async ({ ctx: { user, prisma, req, res }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            accountType: input.step1.userType.toUpperCase() as AccountType,
            onboarded: true,
          },
        });

        await prisma.profile.upsert({
          where: { userId: user.id },
          update: {
            howHear: input.step2.howHear,
            howHearOther: input.step2.otherText,
            goals: input.step3.goals,
            individualFocus: input.step1.individualFocus,
            organizationPurpose: input.step1.organizationPurpose,
          },
          create: {
            userId: user.id,
            howHear: input.step2.howHear,
            howHearOther: input.step2.otherText,
            goals: input.step3.goals,
            individualFocus: input.step1.individualFocus,
            organizationPurpose: input.step1.organizationPurpose,
          },
        });

        const skillConnects = await Promise.all(
          input.step4.skills.map(async (skillName) => {
            const skill = await prisma.skill.upsert({
              where: { name: skillName },
              update: {},
              create: {
                name: skillName,
                slug: skillName.toLowerCase().replace(/\s/g, "-"),
              },
            });
            return { skillId: skill.id };
          })
        );

        await prisma.profile.update({
          where: { userId: user.id },
          data: {
            skills: {
              deleteMany: {},
              create: skillConnects.map((s) => ({
                skill: { connect: { id: s.skillId } },
              })),
            },
          },
        });

        await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        return { message: "Onboarding completed successfully!" };
      } catch (error) {
        console.error("Error completing onboarding:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to complete onboarding",
        });
      }
    }),

  toggleFreelancerPublicStatus: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        isPublic: z.boolean(),
      })
    )
    .mutation(async ({ ctx: { user, prisma, req, res }, input }) => {
      if (!user?.id || user.id !== input.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to update this profile.",
        });
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { accountType: true },
      });

      if (currentUser?.accountType !== AccountType.INDIVIDUAL) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Only individual accounts can be listed as public freelancers.",
        });
      }

      try {
        await prisma.profile.update({
          where: { userId: input.userId },
          data: {
            isPublicFreelancer: input.isPublic,
          },
        });

        await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        return {
          message: `Freelancer public status updated to ${input.isPublic}`,
          isPublicFreelancer: input.isPublic,
        };
      } catch (error) {
        console.error("Error toggling freelancer public status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update freelancer public status",
        });
      }
    }),

  updateIdVerification: protectedProcedure
    .input(
      z.object({
        idFrontImage: z.string().url().optional(),
        idBackImage: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx: { user, prisma, req, res }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      try {
        console.log("updateIdVerification mutation received input:", input);

        const verificationData: {
          idFrontImage?: string;
          idBackImage?: string;
          status: VerificationStatus;
        } = {
          status: VerificationStatus.PENDING, // Set status to PENDING upon submission
        };

        if (input.idFrontImage) {
          verificationData.idFrontImage = input.idFrontImage;
        }
        if (input.idBackImage) {
          verificationData.idBackImage = input.idBackImage;
        }

        console.log("Verification data to upsert:", verificationData);

        const updatedVerification = await prisma.verification.upsert({
          where: { userId: user.id },
          update: verificationData,
          create: {
            userId: user.id,
            ...verificationData,
          },
        });
        console.log("Upserted verification record:", updatedVerification);

        // Update user's isVerified status if verification is approved
        if (updatedVerification.status === VerificationStatus.APPROVED) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true },
          });
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: false },
          });
        }

        await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        return {
          message: "ID verification images submitted successfully",
          verificationStatus: updatedVerification.status,
        };
      } catch (error) {
        console.error("Error updating ID verification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update ID verification",
        });
      }
    }),

  updateIsOpenToWork: protectedProcedure
    .input(z.object({ isOpenToWork: z.boolean() }))
    .mutation(async ({ ctx: { user, prisma, req, res }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }
      try {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            isOpenToWork: input.isOpenToWork,
          },
        });
        await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });
        return {
          message:
            "the user is open to work the status is updated successfully",
          isOpenToWork: updatedUser.isOpenToWork,
        };
      } catch (error) {
        console.error("Error Update isOpenToWork status got error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update isOpenToWork status",
        });
      }
    }),

  getPendingVerifications: protectedProcedure.query(
    async ({ ctx: { user, prisma } }) => {
      // TODO: Add admin role check here
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const pendingVerifications = await prisma.verification.findMany({
        where: {
          status: VerificationStatus.PENDING,
        },
        select: {
          id: true,
          status: true,
          idFrontImage: true,
          idBackImage: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              accountType: true,
            },
          },
          createdAt: true,
        },
      });

      return pendingVerifications;
    }
  ),

  updateUserVerificationStatus: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        status: z.nativeEnum(VerificationStatus),
        // Removed reason from input schema as it's not in the Prisma model yet
      })
    )
    .mutation(async ({ ctx: { user, prisma, req, res }, input }) => {
      // TODO: Add admin role check here
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const { userId, status } = input; // Removed reason from destructuring

      try {
        const updatedVerification = await prisma.verification.update({
          where: { userId: userId },
          data: {
            status: status,
            // Removed reason from update data as it's not in the Prisma model yet
          },
        });

        // Update user's isVerified status based on verification status
        await prisma.user.update({
          where: { id: userId },
          data: { isVerified: status === VerificationStatus.APPROVED },
        });

        await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        return {
          message: `User verification status updated to ${status}`,
          verification: updatedVerification,
        };
      } catch (error) {
        console.error("Error updating user verification status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user verification status",
        });
      }
    }),
});
