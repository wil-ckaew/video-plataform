import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import DocumentCardComponent from '../../components/DocumentCardComponent';
import Header from '../../components/Header';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';

interface Document {
  id: string;
  student_id: string;
  doc_type: string;
  filename: string;
  created_at: string;
}

interface Student {
  id: string;
  name: string;
}

const DocumentsPage: React.FC = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [selectedStudent]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch documents
      const docResponse = await api.get('/api/documents', {
        params: selectedStudent ? { student_id: selectedStudent } : {},
      });
      setDocuments(docResponse.data.documents || []);

      // Fetch students
      const studentResponse = await api.get('/api/students');
      setStudents(studentResponse.data.students || []);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(`Error loading data: ${err.message}`);
      } else {
        setError('Unexpected error occurred while fetching data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = () => {
    router.push('/documents/add-document');
  };

  const handleEdit = (id: string) => {
    router.push(`/documents/edit-document?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/api/documents/${id}`);
        setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
        alert('Document deleted successfully');
      } catch (err) {
        alert('Failed to delete the document. Please try again.');
      }
    }
  };

  const handleView = (filename: string) => {
    const filePath = `http://localhost:8080/uploads/${encodeURIComponent(filename)}`;
    window.open(filePath, '_blank');
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStudent(e.target.value);
  };

  const studentMap = students.reduce(
    (map, student) => {
      map[student.id] = student.name;
      return map;
    },
    {} as Record<string, string>
  );

  const filteredDocuments = selectedStudent
    ? documents.filter((doc) => doc.student_id === selectedStudent)
    : documents;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Documents</h1>
          <button
            onClick={handleAddDocument}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Document
          </button>
        </div>

        {/* Select Student */}
        <div className="mb-4">
          <label htmlFor="studentSelect" className="block text-gray-700 font-medium mb-2">
            Filter by Student:
          </label>
          <select
            id="studentSelect"
            value={selectedStudent}
            onChange={handleStudentChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <DocumentCardComponent
                  key={doc.id}
                  document={doc}
                  name={studentMap[doc.student_id] || 'Unknown'}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={() => handleView(doc.filename)}
                />
              ))
            ) : (
              <p className="text-center text-gray-600">No documents available</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DocumentsPage;
