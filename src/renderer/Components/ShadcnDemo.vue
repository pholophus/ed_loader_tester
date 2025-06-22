<template>
  <div class="p-6 space-y-6">
    <h1 class="text-3xl font-bold">shadcn/vue Demo</h1>
    
    <!-- Card Example -->
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome to shadcn/vue</CardTitle>
        <CardDescription>
          Beautiful components built with Radix and Tailwind CSS.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <label class="text-sm font-medium">Your Name</label>
          <Input 
            v-model="name" 
            placeholder="Enter your name" 
            class="mt-1"
          />
        </div>
        <div v-if="name" class="text-sm text-muted-foreground">
          Hello, {{ name }}! 👋
        </div>
      </CardContent>
      <CardFooter class="flex gap-2">
        <Button @click="handleSubmit" :disabled="!name">
          Submit
        </Button>
        <Button variant="outline" @click="handleReset">
          Reset
        </Button>
      </CardFooter>
    </Card>

    <!-- Button Variants Example -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Button Variants</h2>
      <div class="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </div>

    <!-- Form Example with your existing brand colors -->
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-brand-500">Contact Form</CardTitle>
        <CardDescription>
          Using your existing brand colors with shadcn components
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <Input 
            v-model="email" 
            placeholder="Email address" 
            type="email"
          />
        </div>
        <div>
          <Input 
            v-model="message" 
            placeholder="Your message" 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          class="bg-brand-500 hover:bg-brand-600 text-white w-full"
          @click="handleContactSubmit"
        >
          Send Message
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/Components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/Components/ui/card'
import { Input } from '@/Components/ui/input'

const name = ref('')
const email = ref('')
const message = ref('')

const handleSubmit = () => {
  // console.log('Form submitted:', { name: name.value })
  // You can add your logic here
}

const handleReset = () => {
  name.value = ''
}

const handleContactSubmit = () => {
  // console.log('Contact form submitted:', { 
  //   email: email.value, 
  //   message: message.value 
  // })
  // You can add your logic here
}
</script> 