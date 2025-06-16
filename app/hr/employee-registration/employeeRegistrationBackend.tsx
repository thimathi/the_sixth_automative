import { supabase } from "@/utils/supabase"

interface EmployeeRegistrationData {
    // Personal Information
    firstName: string
    lastName: string
    dob: string
    gender: string
    email: string
    phone: string
    address: string
    photo: File | null

    // Employment Information
    employeeId: string
    joiningDate: string
    department: string
    position: string
    employmentType: string
    reportingManager: string
    workLocation: string

    // Financial Information
    basicSalary: string
    bankName: string
    accountNumber: string
    epfNumber: string

    // Documents
    resume: File | null
    idProof: File | null
    addressProof: File | null
    otherDocuments: File[]
}

export const registerEmployee = async (data: EmployeeRegistrationData) => {
    try {
        // First upload all files to storage
        const photoUrl = data.photo ? await uploadFile(data.photo, 'employee-photos') : null
        const resumeUrl = data.resume ? await uploadFile(data.resume, 'employee-documents') : null
        const idProofUrl = data.idProof ? await uploadFile(data.idProof, 'employee-documents') : null
        const addressProofUrl = data.addressProof ? await uploadFile(data.addressProof, 'employee-documents') : null

        const otherDocumentUrls = await Promise.all(
            data.otherDocuments.map(file => uploadFile(file, 'employee-documents')))

        // Then insert the employee record
        const { error } = await supabase
            .from('employee')
            .insert({
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                phone: data.phone,
                gender: data.gender,
                empAddress: data.address,
                dob: data.dob,
                empId: data.employeeId,
                department: data.department,
                position: data.position,
                employment_type: data.employmentType,
                reporting_manager: data.reportingManager,
                work_location: data.workLocation,
                basic_salary: parseFloat(data.basicSalary),
                bank_name: data.bankName,
                account_number: data.accountNumber,
                epf_number: data.epfNumber,
                photo_url: photoUrl,
                resume_url: resumeUrl,
                id_proof_url: idProofUrl,
                address_proof_url: addressProofUrl,
                other_documents_urls: otherDocumentUrls,
                status: 'Active',
                role: 'employee',
                joining_date: data.joiningDate,
            })

        if (error) throw error

    } catch (error) {
        console.error('Error registering employee:', error)
        throw error instanceof Error ? error : new Error('Failed to register employee')
    }
}

const uploadFile = async (file: File, bucket: string): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase
            .storage
            .from(bucket)
            .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get the public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from(bucket)
            .getPublicUrl(filePath)

        return publicUrl
    } catch (error) {
        console.error('Error uploading file:', error)
        throw error instanceof Error ? error : new Error('Failed to upload file')
    }
}