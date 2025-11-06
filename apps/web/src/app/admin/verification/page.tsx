"use client";

import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { VerificationStatus } from "@my-better-t-app/db/prisma/generated/enums"; // Corrected import path for VerificationStatus

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

export default function AdminVerificationPage() {
  const {
    data: pendingVerifications,
    isLoading,
    refetch,
  } = trpc.user.getPendingVerifications.useQuery(); // Changed api to trpc
  const { mutateAsync: updateUserVerificationStatus } =
    trpc.user.updateUserVerificationStatus.useMutation(); // Changed api to trpc

  const handleApprove = async (userId: string) => {
    try {
      await updateUserVerificationStatus({
        userId,
        status: VerificationStatus.APPROVED,
      });
      toast.success("User verification approved!");
      refetch();
    } catch (error) {
      toast.error("Failed to approve verification.");
      console.error("Error approving verification:", error);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      // In a real application, you might want to prompt for a reason for rejection
      await updateUserVerificationStatus({
        userId,
        status: VerificationStatus.REJECTED,
        reason: "Admin rejected verification", // Placeholder reason
      });
      toast.success("User verification rejected!");
      refetch();
    } catch (error) {
      toast.error("Failed to reject verification.");
      console.error("Error rejecting verification:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">Loading verifications...</div>
    );
  }

  if (!pendingVerifications || pendingVerifications.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Verification</h1>
        <p>No pending verifications found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Verification</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pendingVerifications.map(
          (verification: (typeof pendingVerifications)[0]) => {
            const idFrontImageSrc = verification.idFrontImage
              ? verification.idFrontImage
              : null;
            const idBackImageSrc = verification.idBackImage
              ? verification.idBackImage
              : null;

            console.log("ID Front Image src:", idFrontImageSrc);
            console.log("ID Back Image src:", idBackImageSrc);

            return (
              <Card key={verification.id}>
                <CardHeader>
                  <CardTitle>
                    {verification.user?.name || "Unknown User"}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {verification.user?.email || "No email available"}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">ID Front Image:</h3>
                      {idFrontImageSrc ? (
                        <Image
                          src={idFrontImageSrc}
                          alt="ID Front"
                          width={300}
                          height={200}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <p>No front image uploaded.</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">ID Back Image:</h3>
                      {idBackImageSrc ? (
                        <Image
                          src={idBackImageSrc}
                          alt="ID Back"
                          width={300}
                          height={200}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <p>No back image uploaded.</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {verification.user?.id ? (
                        <>
                          <Button
                            onClick={() => handleApprove(verification.user.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(verification.user.id)}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <p className="text-red-500">
                          User data missing for verification.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>
    </div>
  );
}
