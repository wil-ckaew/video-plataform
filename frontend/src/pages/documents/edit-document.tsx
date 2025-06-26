import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig';
import { AxiosError } from 'axios';
import Header from '../../components/Header';

interface Document {
  id: string;
  student_id: string;
  doc_type: string;
  filename: string;
  created_at: string;
}

const EditDocumentPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [document, setDocument] = useState<Document | null>(null);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    student_id: string;
    doc_type: string;
    file: File | null;
    filename: string; // Adicionado ao estado para permitir edição
  }>({
    student_id: '',
    doc_type: '',
    file: null,
    filename: '', // Inicialmente vazio
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/students');
        setStudents(response.data.students || []);
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(`Error fetching students: ${error.message}`);
        } else {
          setError('Unknown error occurred');
        }
      }
    };

    const fetchDocument = async () => {
      if (id) {
        try {
          const response = await api.get(`/api/documents/${id}`);
          const fetchedDocument = response.data.document;
          setDocument(fetchedDocument);
          setFormData({
            student_id: fetchedDocument.student_id,
            doc_type: fetchedDocument.doc_type,
            filename: fetchedDocument.filename, // Inicializa com o nome do arquivo atual
            file: null,
          });
          setError(null);
        } catch (error) {
          if (error instanceof AxiosError) {
            setError(`Error fetching document data: ${error.message}`);
          } else {
            setError('Unknown error occurred');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStudents();
    fetchDocument();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData(prevState => ({
        ...prevState,
        file: files[0],
      }));
    } else {
      setFormData(prevState => ({ ...prevState, file: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = new FormData();
    updatedData.append('student_id', formData.student_id);
    updatedData.append('doc_type', formData.doc_type);

    // Adiciona o nome do arquivo atual ao enviar, se não houver um novo arquivo
    updatedData.append('filename', formData.filename);
    if (formData.file) {
      updatedData.append('file', formData.file);
    }

    try {
      await api.patch(`/api/documents/${id}`, updatedData);
      alert('Document updated successfully');
      router.push('/documents/documents');
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Error updating document: ${error.message}`);
      } else {
        alert('Error updating document: Unknown error');
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Edit Document</h1>
        {document && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="student_id" className="block text-gray-700">Student</label>
              <select
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filename" className="block text-gray-700">Current Filename</label>
              <input
                type="text"
                id="filename"
                name="filename" // Adicione o name aqui para o handleChange funcionar
                value={formData.filename} // Agora o valor vem do estado
                onChange={handleChange} // Permite edição
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label htmlFor="doc_type" className="block text-gray-700">Document Type</label>
              <input
                type="text"
                id="doc_type"
                name="doc_type"
                value={formData.doc_type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="file" className="block text-gray-700">Upload New Document (Optional)</label>
              <input
                type="file"
                id="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Document
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default EditDocumentPage;
