import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export const checkUser = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const username = `${name.split(" ").join("-")}${user.id.slice(-4)}`;

    // Create new user in database first
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress,
        username: username,
      },
    });

    // Update Clerk user separately - remove if not needed
    try {
      await clerkClient.users.updateUserMetadata(user.id, {
        publicMetadata: {
          username: username
        }
      });
    } catch (clerkError) {
      console.error('Error updating Clerk metadata:', clerkError);
      // Continue execution even if Clerk update fails
    }

    return newUser;
  } catch (error) {
    console.error('Error in checkUser:', error);
    throw error;
  }
};