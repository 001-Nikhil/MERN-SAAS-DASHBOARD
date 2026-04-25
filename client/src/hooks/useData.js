import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

export function useAnalytics(days = 30) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, revenue, users] = await Promise.all([
        api.get(`/analytics/overview?days=${days}`),
        api.get('/analytics/revenue?months=6'),
        api.get(`/analytics/users?days=${days}`),
      ]);
      setData({
        overview: overview.data,
        revenue: revenue.data,
        users: users.data,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, statsRes] = await Promise.all([
        api.get('/projects?limit=50'),
        api.get('/projects/stats'),
      ]);
      setProjects(projRes.data.projects);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = async (data) => {
    const res = await api.post('/projects', data);
    setProjects((prev) => [res.data.project, ...prev]);
    return res.data.project;
  };

  const updateProject = async (id, data) => {
    const res = await api.patch(`/projects/${id}`, data);
    setProjects((prev) => prev.map((p) => (p._id === id ? res.data.project : p)));
    return res.data.project;
  };

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p._id !== id));
  };

  return { projects, stats, loading, error, createProject, updateProject, deleteProject, refetch: fetchProjects };
}

export function useTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenants/members');
      setMembers(res.data.members);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch team');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const inviteMember = async (data) => {
    const res = await api.post('/tenants/invite', data);
    await fetchMembers();
    return res.data;
  };

  const removeMember = async (userId) => {
    await api.delete(`/tenants/members/${userId}`);
    setMembers((prev) => prev.filter((m) => m._id !== userId));
  };

  return { members, loading, error, inviteMember, removeMember, refetch: fetchMembers };
}