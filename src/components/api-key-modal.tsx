"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Copy, Check, Eye, EyeOff } from "lucide-react"
import { toast } from "react-toastify"

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  apiKey: string
  organizationName: string
}

export default function ApiKeyModal({ isOpen, onClose, apiKey, organizationName }: ApiKeyModalProps) {
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      toast.success("API key copied")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy, Please copy the API key manually.")
    }
  }

  const maskedApiKey = apiKey.replace(/(.{8})(.*)(.{4})/, "$1" + "*".repeat(20) + "$3")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-black text-center">Organization Created Successfully!</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600">
              <span className="font-medium text-black">{organizationName}</span> has been created successfully.
            </p>
            <p className="text-sm text-gray-500 mt-1">Here is your API key for accessing the reporting system:</p>
          </div>

          <div className="space-y-2">
            <Label className="text-black font-medium">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={showKey ? apiKey : maskedApiKey}
                  readOnly
                  className="border-gray-300 pr-10 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="border-gray-300 hover:bg-gray-50"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-600">
              <strong>Important:</strong> Please save this API key securely. You won't be able to see it again after
              closing this dialog.
            </p>
          </div>

          <Button onClick={onClose} className="w-full bg-black hover:bg-gray-800 text-white">
            I've Saved the API Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
