import axios from 'axios'
import {useState, useContext} from 'react'
import {type NetListRow, NetListRowSchema} from '../../netlist/netlist'
import type {ErrorType} from '../../utils/true-or-error'
import UserContext from '../context/UserContext'
import {handleErrorWithHook} from '../hooks/error'
import ErrorComponent from './ErrorComponent'
import './AddNetList.css'

type AddNetListProps = {
    callback: (_: NetListRow) => void
}


function AddNetList({callback}: AddNetListProps) {
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [errors, setErrors] = useState<ErrorType[]>([])
    const context = useContext(UserContext)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
            setUploadSuccess(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!file) {
            setErrors([{message: 'Please select a file to upload'}])
            return
        }

        if (!context?.user) {
            setErrors([{message: 'You must be logged in to upload files'}])
            return
        }

        const token = localStorage.getItem('token')
        if (!token) {
            setErrors([{message: 'Authentication token not found. Please log in again.'}])
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        setIsUploading(true)

        try {
            const resp = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            })
            const parsedRow = await NetListRowSchema.safeParseAsync(resp.data)
            if (!parsedRow.success) {
                setErrors([{message: 'server did not indicate failure but returned malformed data'}])
                return
            }

            setUploadSuccess(true)
            setFile(null)
            // Reset the file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement
            if (fileInput) fileInput.value = ''
            callback(parsedRow.data)
        } catch (error) {
            handleErrorWithHook(error, setErrors)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="add-netlist-container">
            {errors.length > 0 && <ErrorComponent messages={errors} onClick={() => setErrors([])}/>}

            <h3 className="upload-title">UPLOAD</h3>

            <form onSubmit={handleSubmit} className="upload-form">
                <div className="file-input-container">
                    <label htmlFor="file-upload" className="file-input-label">
                        {file ? file.name : 'Choose File'}
                    </label>
                    <input
                        type="file"
                        id="file-upload"
                        onChange={handleFileChange}
                        className="file-input"
                    />
                </div>

                <button
                    type="submit"
                    className="upload-button"
                    disabled={!file || isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Upload'}
                </button>
            </form>

            {uploadSuccess && (
                <div className="success-message">
                    File uploaded successfully!
                </div>
            )}
        </div>
    )
}

export default AddNetList