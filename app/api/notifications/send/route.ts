
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/notifications/send - Send notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      channelIds,
      type,
      title,
      message,
      alertId,
      incidentId,
      templateId,
      variables,
    } = body

    if (!channelIds || channelIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one channel required' },
        { status: 400 }
      )
    }

    // Get template if provided
    let finalTitle = title
    let finalMessage = message

    if (templateId) {
      const template = await prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      })

      if (template) {
        finalTitle = renderTemplate(template.subject || '', variables || {})
        finalMessage = renderTemplate(template.body, variables || {})
      }
    }

    // Create notifications for each channel
    const notifications = []
    for (const channelId of channelIds) {
      const notification = await prisma.notification.create({
        data: {
          channelId,
          type,
          title: finalTitle || 'Notification',
          message: finalMessage,
          alertId,
          incidentId,
          status: 'pending',
        },
      })

      // Send notification asynchronously
      sendNotification(notification.id, channelId, finalTitle, finalMessage).catch(
        (error) => {
          console.error(`Failed to send notification ${notification.id}:`, error)
        }
      )

      notifications.push(notification)
    }

    return NextResponse.json(
      {
        message: 'Notifications queued',
        notifications,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}

// Notification delivery function
async function sendNotification(
  notificationId: string,
  channelId: string,
  title: string,
  message: string
) {
  try {
    // Get channel configuration
    const channel = await prisma.notificationChannel.findUnique({
      where: { id: channelId },
    })

    if (!channel || channel.status !== 'active') {
      throw new Error('Channel not active')
    }

    // Create delivery record
    const delivery = await prisma.notificationDelivery.create({
      data: {
        notificationId,
        channelId,
        status: 'PENDING',
      },
    })

    // Send based on channel type
    let success = false
    let errorMessage = null

    try {
      switch (channel.type) {
        case 'EMAIL':
          await sendEmail(channel.config, title, message)
          success = true
          break

        case 'SLACK':
          await sendSlack(channel.config, title, message)
          success = true
          break

        case 'WEBHOOK':
          await sendWebhook(channel.config, title, message)
          success = true
          break

        case 'TEAMS':
          await sendTeams(channel.config, title, message)
          success = true
          break

        case 'PAGERDUTY':
          await sendPagerDuty(channel.config, title, message)
          success = true
          break

        default:
          throw new Error(`Unsupported channel type: ${channel.type}`)
      }
    } catch (error: any) {
      errorMessage = error.message
    }

    // Update delivery status
    await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: {
        status: success ? 'SENT' : 'FAILED',
        deliveredAt: success ? new Date() : null,
        errorMessage,
      },
    })

    // Update notification status
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: success ? 'sent' : 'failed',
        sentAt: success ? new Date() : null,
        errorMsg: errorMessage,
      },
    })
  } catch (error: any) {
    console.error('Error in sendNotification:', error)
    
    // Update as failed
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'failed',
        errorMsg: error.message,
      },
    })
  }
}

// Channel-specific delivery functions (mock implementations)
async function sendEmail(config: any, title: string, message: string) {
  // In production, integrate with SendGrid, AWS SES, etc.
  console.log('Sending email:', { to: config.email, subject: title, body: message })
  
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  return { success: true }
}

async function sendSlack(config: any, title: string, message: string) {
  // In production, use Slack Web API or Webhooks
  console.log('Sending Slack message:', { webhook: config.webhookUrl, text: message })
  
  const payload = {
    text: `*${title}*\n${message}`,
    channel: config.channel,
  }

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  return { success: true }
}

async function sendWebhook(config: any, title: string, message: string) {
  // Send HTTP POST to webhook URL
  console.log('Sending webhook:', { url: config.url, title, message })
  
  const payload = {
    title,
    message,
    timestamp: new Date().toISOString(),
  }

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  return { success: true }
}

async function sendTeams(config: any, title: string, message: string) {
  // Send to Microsoft Teams via webhook
  console.log('Sending Teams message:', { webhook: config.webhookUrl, title, message })
  
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  return { success: true }
}

async function sendPagerDuty(config: any, title: string, message: string) {
  // Send to PagerDuty Events API
  console.log('Sending PagerDuty alert:', { integrationKey: config.integrationKey, title })
  
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  return { success: true }
}

// Template variable replacement
function renderTemplate(template: string, variables: Record<string, any>): string {
  let rendered = template

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    rendered = rendered.replace(regex, String(value))
  })

  return rendered
}
