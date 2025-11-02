import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPAProject } from '@/models/GPA_project'
import { GPANotification } from '@/models/GPA_notification'
import { GPAUser } from '@/models/GPA_user';
