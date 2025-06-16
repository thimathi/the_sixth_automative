import { supabase } from "@/utils/supabase"

interface Task {
    id: string;
    title: string;
    description: string;
    priority: string;
    type: string;
    dueDate: string;
    status: "pending" | "in-progress" | "completed" | "overdue";
    assignee: {
        id: string;
        name: string;
        position: string;
        avatar?: string;
    };
    vehicleInfo?: {
        make?: string;
        model?: string;
        licensePlate?: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface TaskTemplate {
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    defaultAssignee?: string;
    createdAt: string;
    updatedAt: string;
}

interface CreateTaskOptions {
    title: string;
    description: string;
    priority: string;
    type: string;
    dueDate: string;
    assigneeId: string;
    vehicleInfo?: {
        make?: string;
        model?: string;
        licensePlate?: string;
    };
}

export const getActiveTasks = async (managerId: string): Promise<{ data: Task[], error: string | null }> => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
        id,
        title,
        description,
        priority,
        type,
        due_date,
        status,
        assignee:employee(
          id,
          name:first_name,
          position:role,
          avatar:avatarUrl
        ),
        vehicle_make,
        vehicle_model,
        vehicle_license_plate,
        created_at,
        updated_at
      `)
            .neq('status', 'completed')
            .order('due_date', { ascending: true })

        if (error) throw error

        const formattedData: Task[] = data.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            type: task.type,
            dueDate: task.due_date,
            status: task.status,
            assignee: {
                id: task.assignee.id,
                name: task.assignee.name,
                position: task.assignee.position,
                avatar: task.assignee.avatar
            },
            vehicleInfo: {
                make: task.vehicle_make,
                model: task.vehicle_model,
                licensePlate: task.vehicle_license_plate
            },
            createdAt: task.created_at,
            updatedAt: task.updated_at
        }))

        return { data: formattedData, error: null }
    } catch (error) {
        console.error('Error fetching active tasks:', error)
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch active tasks'
        }
    }
}

export const getCompletedTasks = async (managerId: string): Promise<{ data: Task[], error: string | null }> => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
        id,
        title,
        description,
        priority,
        type,
        due_date,
        status,
        assignee:employee(
          id,
          name:first_name,
          position:role,
          avatar:avatarUrl
        ),
        vehicle_make,
        vehicle_model,
        vehicle_license_plate,
        created_at,
        updated_at
      `)
            .eq('status', 'completed')
            .order('updated_at', { ascending: false })
            .limit(50)

        if (error) throw error

        const formattedData: Task[] = data.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            type: task.type,
            dueDate: task.due_date,
            status: task.status,
            assignee: {
                id: task.assignee.id,
                name: task.assignee.name,
                position: task.assignee.position,
                avatar: task.assignee.avatar
            },
            vehicleInfo: {
                make: task.vehicle_make,
                model: task.vehicle_model,
                licensePlate: task.vehicle_license_plate
            },
            createdAt: task.created_at,
            updatedAt: task.updated_at
        }))

        return { data: formattedData, error: null }
    } catch (error) {
        console.error('Error fetching completed tasks:', error)
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch completed tasks'
        }
    }
}

export const getTaskTemplates = async (managerId: string): Promise<{ data: TaskTemplate[], error: string | null }> => {
    try {
        const { data, error } = await supabase
            .from('task_templates')
            .select('*')
            .eq('created_by', managerId)
            .order('updated_at', { ascending: false })

        if (error) throw error

        const formattedData: TaskTemplate[] = data.map((template: any) => ({
            id: template.id,
            title: template.title,
            description: template.description,
            type: template.type,
            priority: template.priority,
            defaultAssignee: template.default_assignee,
            createdAt: template.created_at,
            updatedAt: template.updated_at
        }))

        return { data: formattedData, error: null }
    } catch (error) {
        console.error('Error fetching task templates:', error)
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch task templates'
        }
    }
}

export const createTask = async (
    managerId: string,
    options: CreateTaskOptions
): Promise<{ data: Task | null, error: string | null }> => {
    try {
        const taskId = `task-${Date.now()}`

        const { error } = await supabase
            .from('tasks')
            .insert({
                id: taskId,
                title: options.title,
                description: options.description,
                priority: options.priority,
                type: options.type,
                due_date: options.dueDate,
                status: 'pending',
                assignee_id: options.assigneeId,
                vehicle_make: options.vehicleInfo?.make,
                vehicle_model: options.vehicleInfo?.model,
                vehicle_license_plate: options.vehicleInfo?.licensePlate,
                created_by: managerId
            })

        if (error) throw error

        // Get the newly created task with assignee details
        const { data: newTask, error: fetchError } = await supabase
            .from('tasks')
            .select(`
        id,
        title,
        description,
        priority,
        type,
        due_date,
        status,
        assignee:employee(
          id,
          name:first_name,
          position:role,
          avatar:avatarUrl
        ),
        vehicle_make,
        vehicle_model,
        vehicle_license_plate,
        created_at,
        updated_at
      `)
            .eq('id', taskId)
            .single()

        if (fetchError) throw fetchError

        return {
            data: {
                id: newTask.id,
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
                type: newTask.type,
                dueDate: newTask.due_date,
                status: newTask.status,
                assignee: {
                    //@ts-ignore
                    id: newTask.assignee.id,
                    //@ts-ignore
                    name: newTask.assignee.name,
                    //@ts-ignore
                    position: newTask.assignee.position,
                    //@ts-ignore
                    avatar: newTask.assignee.avatar
                },
                vehicleInfo: {
                    make: newTask.vehicle_make,
                    model: newTask.vehicle_model,
                    licensePlate: newTask.vehicle_license_plate
                },
                createdAt: newTask.created_at,
                updatedAt: newTask.updated_at
            },
            error: null
        }
    } catch (error) {
        console.error('Error creating task:', error)
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to create task'
        }
    }
}

export const updateTaskStatus = async (
    managerId: string,
    taskId: string,
    status: Task['status']
): Promise<{ data: Task | null, error: string | null }> => {
    try {
        const { error } = await supabase
            .from('tasks')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId)

        if (error) throw error

        // Get the updated task
        const { data: updatedTask, error: fetchError } = await supabase
            .from('tasks')
            .select(`
        id,
        title,
        description,
        priority,
        type,
        due_date,
        status,
        assignee:employee(
          id,
          name:first_name,
          position:role,
          avatar:avatarUrl
        ),
        vehicle_make,
        vehicle_model,
        vehicle_license_plate,
        created_at,
        updated_at
      `)
            .eq('id', taskId)
            .single()

        if (fetchError) throw fetchError

        return {
            data: {
                id: updatedTask.id,
                title: updatedTask.title,
                description: updatedTask.description,
                priority: updatedTask.priority,
                type: updatedTask.type,
                dueDate: updatedTask.due_date,
                status: updatedTask.status,
                assignee: {
                    //@ts-ignore
                    id: updatedTask.assignee.id,
                    //@ts-ignore
                    name: updatedTask.assignee.name,
                    //@ts-ignore
                    position: updatedTask.assignee.position,
                    //@ts-ignore
                    avatar: updatedTask.assignee.avatar
                },
                vehicleInfo: {
                    make: updatedTask.vehicle_make,
                    model: updatedTask.vehicle_model,
                    licensePlate: updatedTask.vehicle_license_plate
                },
                createdAt: updatedTask.created_at,
                updatedAt: updatedTask.updated_at
            },
            error: null
        }
    } catch (error) {
        console.error('Error updating task status:', error)
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to update task status'
        }
    }
}

export const saveTaskTemplate = async (
    managerId: string,
    options: {
        title: string;
        description: string;
        priority: string;
        type: string;
        defaultAssignee?: string;
    }
): Promise<{ data: TaskTemplate | null, error: string | null }> => {
    try {
        const templateId = `template-${Date.now()}`

        const { error } = await supabase
            .from('task_templates')
            .insert({
                id: templateId,
                title: options.title,
                description: options.description,
                priority: options.priority,
                type: options.type,
                default_assignee: options.defaultAssignee,
                created_by: managerId
            })

        if (error) throw error

        // Get the newly created template
        const { data: newTemplate, error: fetchError } = await supabase
            .from('task_templates')
            .select('*')
            .eq('id', templateId)
            .single()

        if (fetchError) throw fetchError

        return {
            data: {
                id: newTemplate.id,
                title: newTemplate.title,
                description: newTemplate.description,
                type: newTemplate.type,
                priority: newTemplate.priority,
                defaultAssignee: newTemplate.default_assignee,
                createdAt: newTemplate.created_at,
                updatedAt: newTemplate.updated_at
            },
            error: null
        }
    } catch (error) {
        console.error('Error saving task template:', error)
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to save task template'
        }
    }
}