"use client"

import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, Mail, Phone, Shield, User, Edit, Camera, CheckCircle } from "lucide-react"

export default function ProfilePage() {
  const { user } = useUser()

  const profileStats = [
    { label: "Member Since", value: "January 2024", icon: Calendar },
    { label: "Total Budgets", value: "12", icon: User },
    { label: "Active Loans", value: "3", icon: Shield },
    { label: "Transactions", value: "247", icon: CheckCircle },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your profile information and account details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.imageUrl || "/placeholder.svg"} alt={user?.fullName || ""} />
                <AvatarFallback className="text-lg">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl">
                {user?.firstName} {user?.lastName}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-1">
                <Mail className="h-4 w-4" />
                {user?.primaryEmailAddress?.emailAddress}
              </CardDescription>
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
              <Badge variant="outline">Pro Member</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal information and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <p className="text-sm font-medium">{user?.firstName || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <p className="text-sm font-medium">{user?.lastName || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <p className="text-sm font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <p className="text-sm font-medium">{user?.primaryPhoneNumber?.phoneNumber || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                  <p className="text-sm font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm font-medium">
                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profileStats.map((stat, index) => (
                  <div key={index} className="text-center p-4 rounded-lg bg-muted/50">
                    <stat.icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Security Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Email Verified</span>
                  </div>
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Phone Verified</span>
                  </div>
                  <Badge variant="outline">{user?.primaryPhoneNumber ? "Verified" : "Not Verified"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Two-Factor Authentication</span>
                  </div>
                  <Badge variant="outline">Not Enabled</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
