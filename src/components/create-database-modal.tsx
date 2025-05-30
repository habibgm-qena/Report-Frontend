"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-toastify"
import $axios from "@/lib/axiosInstance"

interface CreateDatabaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (database: { name: string; id: string }) => void
}

export default function CreateDatabaseModal({ isOpen, onClose, onSuccess }: CreateDatabaseModalProps) {
  const [formData, setFormData] = useState({
    // Admin credentials
    // username: "",
    // password: "",
    // Database info
    name: "",
    description: "",
    host: "",
    port: "",
    database: "",
    // Database connection credentials
    dbUsername: "",
    dbPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare the request body according to backend specification
      const requestBody = {
        name: formData.name,
        description: formData.description,
        host: formData.host,
        port: Number.parseInt(formData.port),
        database: formData.database,
        username: formData.dbUsername, // Database connection username
        password: formData.dbPassword, // Database connection password
      }

      const { data } = await $axios.post('/database/', requestBody, {
        headers: {
            'X-API-KEY': process.env.NEXT_PUBLIC_X_API_KEY,
            ROLE: 'admin'
        }
    });

      console.log("data: ", data);
      onSuccess(data)
      toast.success("Database created successfully")

      // Reset form
      setFormData({
        // username: "",
        // password: "",
        name: "",
        description: "",
        host: "",
        port: "",
        database: "",
        dbUsername: "",
        dbPassword: "",
      })
      onClose()
    } catch (error) {
      console.error("Database creation error:", error)
      toast.error("Failed to create database")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
    //   username: "",
    //   password: "",
      name: "",
      description: "",
      host: "",
      port: "",
      database: "",
      dbUsername: "",
      dbPassword: "",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-black">Create New Database</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Credentials Section */}
          {/* <div className="space-y-4">
            <h3 className="text-sm font-medium text-black">Admin Credentials</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-black">
                  Admin Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter admin username"
                  required
                  className="border-gray-300 focus:border-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">
                  Admin Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter admin password"
                  required
                  className="border-gray-300 focus:border-black"
                />
              </div>
            </div>
          </div> */}

          <Separator />

          {/* Database Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-black">Database Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-black">
                  Database Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter database name"
                  required
                  className="border-gray-300 focus:border-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-black">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter database description"
                  required
                  className="border-gray-300 focus:border-black min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host" className="text-black">
                    Host
                  </Label>
                  <Input
                    id="host"
                    name="host"
                    value={formData.host}
                    onChange={handleChange}
                    placeholder="Enter database host"
                    required
                    className="border-gray-300 focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port" className="text-black">
                    Port
                  </Label>
                  <Input
                    id="port"
                    name="port"
                    type="number"
                    value={formData.port}
                    onChange={handleChange}
                    placeholder="5432"
                    required
                    className="border-gray-300 focus:border-black"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="database" className="text-black">
                  Database Key
                </Label>
                <Input
                  id="database"
                  name="database"
                  value={formData.database}
                  onChange={handleChange}
                  placeholder="Enter database key"
                  required
                  className="border-gray-300 focus:border-black"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Database Connection Credentials Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-black">Database Connection Credentials</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dbUsername" className="text-black">
                  DB Username
                </Label>
                <Input
                  id="dbUsername"
                  name="dbUsername"
                  value={formData.dbUsername}
                  onChange={handleChange}
                  placeholder="Enter DB username"
                  required
                  className="border-gray-300 focus:border-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbPassword" className="text-black">
                  DB Password
                </Label>
                <Input
                  id="dbPassword"
                  name="dbPassword"
                  type="password"
                  value={formData.dbPassword}
                  onChange={handleChange}
                  placeholder="Enter DB password"
                  required
                  className="border-gray-300 focus:border-black"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-black hover:bg-gray-800 text-white">
              {isLoading ? "Creating..." : "Create Database"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
